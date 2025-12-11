// Giao diện nhóm giống bảng chính
function renderGroupGrid() {
  const groupGrid = document.getElementById("groupGrid");
  const groupSelect = document.getElementById("groupActionSelect");
  if (!groupGrid || !groupSelect) return;

  // Cập nhật dropdown chọn nhóm
  groupSelect.innerHTML = '<option value="">-- Chọn nhóm --</option>' +
    groups.map(g => `<option value="${g.id}">${g.name}</option>`).join("");

  const selectedId = parseInt(groupSelect.value, 10);
  if (!selectedId) {
    groupGrid.innerHTML = '<div style="grid-column: span 6; text-align:center; padding:40px; color:#999;">Vui lòng chọn một nhóm để xem thành viên</div>';
    return;
  }

  const grp = groups.find(g => g.id === selectedId);
  if (!grp) {
    groupGrid.innerHTML = '<div style="grid-column: span 6; text-align:center; padding:40px; color:#999;">Không tìm thấy nhóm</div>';
    return;
  }

  const memberIds = grp.studentIds || [];
  const members = students
    .filter(s => memberIds.includes(s.id))
    .sort(sortStudentsByLastName);

  groupGrid.innerHTML = "";

  if (members.length === 0) {
    groupGrid.innerHTML = '<div style="grid-column: span 6; text-align:center; padding:40px; color:#999;">Nhóm này chưa có thành viên</div>';
    return;
  }

  members.forEach((student) => {
    const currentLevel = getCurrentLevel(student.points);
    const progress = getProgressPercentage(student.points);

    const card = document.createElement("div");
    card.className = "student-card";

    // Tạo các nút cộng điểm từ criteriaData.add
    const addButtons = (criteriaData.add || [])
      .filter(c => c.content && c.points > 0)
      .map(c => `
        <button class="btn-criteria add" 
                onclick="applyCriteriaPoint(${student.id}, ${c.points})" 
                title="${c.content} (+${c.points})">
          ${c.icon} +${c.points}
        </button>
      `).join("");

    // Tạo các nút trừ điểm từ criteriaData.subtract
    const subtractButtons = (criteriaData.subtract || [])
      .filter(c => c.content && c.points > 0)
      .map(c => `
        <button class="btn-criteria subtract" 
                onclick="applyCriteriaPoint(${student.id}, -${c.points})" 
                title="${c.content} (-${c.points})">
          ${c.icon} -${c.points}
        </button>
      `).join("");

    card.innerHTML = `
      <div class="student-name" style="margin-bottom:8px; font-size:1.1rem;">${student.name}</div>
      <div class="character-level" style="position:relative;">
        <div class="character-image" style="background: ${currentLevel.color};">
          <img src="${getLevelImage(currentLevel.name)}" alt="${currentLevel.name}" 
               style="width: 100px; height: 100px;" 
               onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
          <span style="display: none; font-size: 3rem;">${currentLevel.icon}</span>
        </div>
        <div class="level-name" style="margin-top:8px;">${currentLevel.name}</div>
      </div>
      <div class="progress-bar" style="margin:12px 0;">
        <div class="progress-fill" style="width: ${progress}%; background: ${getLevelGradient(currentLevel.name)}">
          <div class="progress-text">${Math.round(progress)}%</div>
        </div>
      </div>
      <div class="criteria-controls" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:12px;">
        ${addButtons}
        ${subtractButtons}
      </div>
    `;

    groupGrid.appendChild(card);
  });
}
function applyCriteriaPoint(studentId, pointsChange) {
  const student = students.find(s => s.id === studentId);
  if (!student) {
    console.warn("Không tìm thấy học sinh với ID:", studentId);
    return;
  }

  pushUndo();

  // Tính multiplier dựa trên cấp độ hiện tại
  const currentLevel = getCurrentLevel(student.points);
  const multiplier = currentLevel.multiplier || 1;
  const adjusted = Math.round(Math.abs(pointsChange) * multiplier);
  const finalChange = pointsChange > 0 ? adjusted : -adjusted;

  // Cập nhật điểm
  student.points += finalChange;

  // Lưu lịch sử điểm
  const historyType = "individual"; // Có thể mở rộng thành "group" nếu dùng trong nhóm sau này
  addToStudentHistory(student.id, student.name, finalChange, student.points, historyType);

  // Lưu vào data.json
  saveToJson();

  // Cập nhật toàn bộ giao diện liên quan
  renderStudents();          // Bảng chính
  renderGroupGrid();         // Tab nhóm (nếu đang mở)
  renderTopStudents();       // Top cá nhân
  updateHomeStats();         // Thống kê trang chủ

  // Highlight điểm
  setTimeout(() => {
    const pointEl = document.getElementById(`points-${studentId}`);
    if (pointEl) highlightPoints(`points-${studentId}`);
  }, 50);

  // Âm thanh phản hồi
  if (pointsChange > 0) {
    playGameSound("success");
  } else {
    playGameSound("click");
  }

  // Kiểm tra và thông báo lên cấp
  const newLevel = getCurrentLevel(student.points);
  if (currentLevel.name !== newLevel.name && pointsChange > 0) {
    playGameSound("levelup");
    showLevelUpNotification(student.name, newLevel.name);
  }
}

// todo: Tạm ẩn hàm renderStudents để tránh xung đột với js/ui.js mới
// function renderStudents() {
//   const grid = document.getElementById("studentGrid");
//   if (!grid) return;

//   // Sắp xếp theo alphabet
//   const sortedStudents = [...students].sort((a, b) =>
//     a.name.localeCompare(b.name, "vi")
//   );

//   if (isCompactView) {
//     // === CHẾ ĐỘ COMPACT ===
//     grid.className = "student-grid-compact";
//     grid.innerHTML = "";

//     sortedStudents.forEach((student) => {
//       const currentLevel = getCurrentLevel(student.points);
//       const progress = getProgressPercentage(student.points);

//       const card = document.createElement("div");
//       card.className = "student-card-compact";
//       if (isSelectMultipleMode) {
//         card.classList.add("selectable");
//         card.style.cursor = "pointer";
//         card.onclick = function (e) {
//           if (
//             e.target.type === "checkbox" ||
//             e.target.tagName === "BUTTON" ||
//             e.target.closest("button")
//           ) {
//             return;
//           }
//           const checkbox = document.getElementById(`student-select-${student.id}`);
//           if (checkbox) {
//             checkbox.checked = !checkbox.checked;
//             checkbox.dispatchEvent(new Event("change"));
//           }
//         };
//       }

//       const badgeColor =
//         student.points >= 0
//           ? "linear-gradient(135deg, #4caf50, #66bb6a)"
//           : "linear-gradient(135deg, #f44336, #e57373)";

//       // Tạo nút cộng điểm
//       const addButtons = (criteriaData.add || [])
//         .filter(c => c.content && c.points > 0)
//         .map(c => `
//           <button class="btn-criteria add" onclick="applyCriteriaPoint(${student.id}, ${c.points})" title="${c.content}">
//             ${c.icon || "⭐"} +${c.points}
//           </button>
//         `).join("");

//       // Tạo nút trừ điểm
//       const subtractButtons = (criteriaData.subtract || [])
//         .filter(c => c.content && c.points > 0)
//         .map(c => `
//           <button class="btn-criteria subtract" onclick="applyCriteriaPoint(${student.id}, -${c.points})" title="${c.content}">
//             ${c.icon || "❌"} -${c.points}
//           </button>
//         `).join("");

//       card.innerHTML = `
//         <div class="student-header-compact">
//           ${isSelectMultipleMode ? `<input type="checkbox" class="student-select" id="student-select-${student.id}" style="margin-right: 8px; width: 18px; height: 18px; cursor: pointer;" />` : ""}
//           <div class="student-info-compact">
//             <div style="position:relative; display:inline-block; margin-bottom:8px;">
//               <div class="student-avatar-compact" style="background: ${currentLevel.color}; width: 60px; height: 60px; border-radius:50%; display:flex; align-items:center; justify-content:center; overflow:hidden;">
//                 <img src="${getLevelImage(currentLevel.name)}" alt="${currentLevel.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
//                 <span style="display:none; font-size:2.5rem;">${currentLevel.icon}</span>
//               </div>
//               <div id="points-${student.id}" style="position:absolute; top:-6px; right:-6px; background:${badgeColor}; color:#fff; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:0.95rem; font-weight:bold; border:2.5px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.2); z-index:10;">
//                 ${student.points}
//               </div>
//             </div>
//             <div class="student-name-compact" style="text-align: center; font-size: 1.2rem;">${student.name}</div>
//             <div class="student-level-compact">${currentLevel.name}</div>
//           </div>
//         </div>
//         <div class="student-progress-compact">
//           <div class="student-progress-fill-compact" style="width: ${progress}%; background: ${getLevelGradient(currentLevel.name)};"></div>
//         </div>
//         <div class="criteria-controls-compact" style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-top:8px;">
//           ${addButtons}
//           ${subtractButtons}
//         </div>
//       `;

//       grid.appendChild(card);
//     });
//   } else {
//     // === CHẾ ĐỘ THẺ LỚN (NORMAL) ===
//     grid.style.display = "grid";
//     grid.style.gridTemplateColumns = "repeat(6, 1fr)";
//     grid.style.gap = "20px";
//     grid.innerHTML = "";

//     sortedStudents.forEach((student) => {
//       const currentLevel = getCurrentLevel(student.points);
//       const progress = getProgressPercentage(student.points);

//       const studentCard = document.createElement("div");
//       studentCard.className = "student-card";
//       if (isSelectMultipleMode) {
//         studentCard.style.cursor = "pointer";
//         studentCard.onclick = function (e) {
//           if (
//             e.target.type === "checkbox" ||
//             e.target.tagName === "BUTTON" ||
//             e.target.closest("button")
//           ) {
//             return;
//           }
//           const checkbox = document.getElementById(`student-select-${student.id}`);
//           if (checkbox) {
//             checkbox.checked = !checkbox.checked;
//             checkbox.dispatchEvent(new Event("change"));
//           }
//         };
//       }

//       const badgeColor =
//         student.points >= 0
//           ? "linear-gradient(135deg, #4caf50, #66bb6a)"
//           : "linear-gradient(135deg, #f44336, #e57373)";

//       // Tạo nút cộng/trừ điểm từ criteriaData
//       const addButtons = (criteriaData.add || [])
//         .filter(c => c.content && c.points > 0)
//         .map(c => `
//           <button class="btn-criteria add" onclick="applyCriteriaPoint(${student.id}, ${c.points})" title="${c.content}">
//             ${c.icon || "⭐"} +${c.points}
//           </button>
//         `).join("");

//       const subtractButtons = (criteriaData.subtract || [])
//         .filter(c => c.content && c.points > 0)
//         .map(c => `
//           <button class="btn-criteria subtract" onclick="applyCriteriaPoint(${student.id}, -${c.points})" title="${c.content}">
//             ${c.icon || "❌"} -${c.points}
//           </button>
//         `).join("");

//       studentCard.innerHTML = `
//         ${isSelectMultipleMode ? `<div style="display: flex; justify-content: flex-end; margin-bottom: 6px;"><input type="checkbox" class="student-select" id="student-select-${student.id}" style="width: 16px; height: 16px; cursor: pointer;" /></div>` : ""}
//         <div class="student-name" style="margin-bottom:8px;">${student.name}</div>
//         <div class="character-level" style="position:relative; overflow:visible;">
//           <div class="character-image" style="background: ${currentLevel.color};">
//             <img src="${getLevelImage(currentLevel.name)}" alt="${currentLevel.name}" style="width: 82px; height: 82px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
//             <span style="display: none;">${currentLevel.icon}</span>
//           </div>
//           <div id="points-${student.id}" style="position:absolute; top:2px; left:calc(50% + 38px); background:${badgeColor}; color:#fff; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:bold; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.2); z-index:10;">
//             ${student.points}
//           </div>
//           <div class="level-name">${currentLevel.name}</div>
//         </div>
//         <div class="progress-bar">
//           <div class="progress-fill" style="width: ${progress}%; background: ${getLevelGradient(currentLevel.name)}">
//             <div class="progress-text">${Math.round(progress)}%</div>
//           </div>
//         </div>
//         <div class="criteria-controls" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:12px;">
//           ${addButtons}
//           ${subtractButtons}
//         </div>
//       `;

//       grid.appendChild(studentCard);
//     });
//   }

//   updateHomeStats();
// }