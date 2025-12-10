// Dữ liệu học sinh
let students = JSON.parse(localStorage.getItem("students")) || [];

// Cấp độ và điểm cần thiết (có hệ số thưởng) + lưu chỉnh sửa
let levels = JSON.parse(localStorage.getItem("levels")) || [
  {
    name: "Dân thường",
    points: 0,
    icon: "👤",
    color: "#FFCA28",
    multiplier: 1,
  },
  { name: "Lính", points: 10, icon: "⚔️", color: "#FFE082", multiplier: 1.25 },
  { name: "Quan", points: 25, icon: "📜", color: "#ffd93d", multiplier: 2 },
  { name: "Tể tướng", points: 40, icon: "🎩", color: "#6bcf7f", multiplier: 3 },
  { name: "Vua", points: 60, icon: "👑", color: "#4ecdc4", multiplier: 4 },
];
function saveLevels() {
  localStorage.setItem("levels", JSON.stringify(levels));
}

// Vật phẩm đổi quà
let rewardItems = JSON.parse(localStorage.getItem("rewardItems")) || [
  {
    level: "Dân thường",
    itemName: "Túi gạo",
    itemImage: "https://cdn-icons-png.flaticon.com/512/2771/2771432.png",
    description: "Túi gạo 5kg",
  },
  {
    level: "Lính",
    itemName: "Bộ đồ dùng học tập",
    itemImage: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
    description: "Bộ bút viết + vở",
  },
  {
    level: "Quan",
    itemName: "Sách hay",
    itemImage: "https://cdn-icons-png.flaticon.com/512/2702/2702134.png",
    description: "Sách kiến thức bổ ích",
  },
  {
    level: "Tể tướng",
    itemName: "Phiếu quà tặng",
    itemImage: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
    description: "Voucher 200.000đ",
  },
  {
    level: "Vua",
    itemName: "Học bổng",
    itemImage: "https://cdn-icons-png.flaticon.com/512/2331/2331941.png",
    description: "Học bổng toàn phần",
  },
];
function saveRewardItems() {
  localStorage.setItem("rewardItems", JSON.stringify(rewardItems));
}

// Lưu theo tuần
function getISOWeek(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
}
function getWeekKey(date = new Date()) {
  const { week, year } = getISOWeek(date);
  return `students_${year}_W${week}`;
}
function loadStudentsForWeek(date = new Date()) {
  const key = getWeekKey(date);
  const data = JSON.parse(localStorage.getItem(key));
  if (Array.isArray(data)) return data;
  let fallback = JSON.parse(localStorage.getItem("students_base"));
  if (!Array.isArray(fallback)) {
    fallback = [
      { id: 1, name: "Nguyễn Văn A", points: 0 },
      { id: 2, name: "Trần Thị B", points: 0 },
      { id: 3, name: "Lê Văn C", points: 0 },
      { id: 4, name: "Phạm Thị D", points: 0 },
      { id: 5, name: "Hoàng Văn E", points: 0 },
    ];
  }
  localStorage.setItem(key, JSON.stringify(fallback));
  return JSON.parse(localStorage.getItem(key));
}
function saveStudentsForWeek(date = new Date()) {
  const key = getWeekKey(date);
  localStorage.setItem(key, JSON.stringify(students));
  localStorage.setItem("students_base", JSON.stringify(students));
}

// Nhóm
let groups = JSON.parse(localStorage.getItem("groups")) || [];
// Đảm bảo tất cả nhóm có trường points (tương thích với dữ liệu cũ)
groups.forEach((group) => {
  if (typeof group.points === "undefined") {
    group.points = 0;
  }
});
function saveGroups() {
  localStorage.setItem("groups", JSON.stringify(groups));
}

// Lịch sử cộng điểm
let pointHistory = JSON.parse(localStorage.getItem("pointHistory")) || [];
function savePointHistory() {
  localStorage.setItem("pointHistory", JSON.stringify(pointHistory));
}

function addToHistory(
  studentId,
  studentName,
  points,
  totalPoints,
  type = "individual"
) {
  const historyItem = {
    id: Date.now() + Math.random(), // ID duy nhất
    studentId: studentId,
    studentName: studentName,
    points: points,
    totalPoints: totalPoints,
    type: type, // 'individual', 'group', 'bulk'
    date: new Date().toISOString(),
  };
  pointHistory.push(historyItem);
  // Chỉ giữ lịch sử 30 ngày gần nhất
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  pointHistory = pointHistory.filter(
    (item) => new Date(item.date) >= thirtyDaysAgo
  );
  savePointHistory();
}

// Bảng điểm cộng trừ
let criteriaData = JSON.parse(localStorage.getItem("criteriaData")) || {
  add: [
    { icon: "⭐", content: "Trả lời đúng", points: 1 },
    { icon: "🏆", content: "Làm bài tốt", points: 2 },
    { icon: "🎯", content: "Hoàn thành bài tập", points: 1 },
  ],
  subtract: [
    { icon: "❌", content: "Không làm bài", points: 1 },
    { icon: "⚠️", content: "Nói chuyện", points: 1 },
    { icon: "🚫", content: "Không chú ý", points: 2 },
  ],
};
function saveCriteriaData() {
  localStorage.setItem("criteriaData", JSON.stringify(criteriaData));
}

// Hàm reset nhóm
function resetAllGroups() {
  if (confirm("Bạn có chắc chắn muốn xóa tất cả nhóm?")) {
    groups = [];
    saveGroups();
    renderGroupsGrid();
    alert("Đã xóa tất cả nhóm!");
  }
}

function resetAllData() {
  if (
    confirm(
      "Bạn có chắc chắn muốn xóa toàn bộ dữ liệu? Hành động này không thể hoàn tác!"
    )
  ) {
    students = [];
    groups = [];
    localStorage.clear();
    saveStudents();
    saveGroups();
    renderStudents();
    renderGroupsGrid();
    renderTopStudents();
    renderTopGroups();
    alert("Đã xóa toàn bộ dữ liệu!");
  }
}

function createGroup() {
  const nameInput = document.getElementById("newGroupName");
  const name = (nameInput.value || "").trim();
  if (!name) return alert("Nhập tên nhóm.");
  const id = Date.now();
  groups.push({ id, name, studentIds: [], points: 0 });
  saveGroups();
  nameInput.value = "";
  renderGroupSelects();
}
function renderGroupSelects() {
  const groupSelect = document.getElementById("groupSelect");
  const calendarGroupSelect = document.getElementById("calendarGroupSelect");
  if (groupSelect)
    groupSelect.innerHTML = groups
      .map((g) => `<option value="${g.id}">${g.name}</option>`)
      .join("");
  if (calendarGroupSelect)
    calendarGroupSelect.innerHTML =
      `<option value="all">Tất cả</option>` +
      groups.map((g) => `<option value="${g.id}">${g.name}</option>`).join("");
}
function assignSelectedStudentsToGroup() {
  const select = document.getElementById("groupSelect");
  const groupId = parseInt(select.value, 10);
  const group = groups.find((g) => g.id === groupId);
  if (!group) return;
  const selectedIds = Array.from(
    document.querySelectorAll(".student-select:checked")
  ).map((cb) => parseInt(cb.value, 10));
  selectedIds.forEach((id) => {
    if (!group.studentIds.includes(id)) group.studentIds.push(id);
  });
  saveGroups();
}

// Khởi tạo theo tuần
if (students.length === 0) {
  students = loadStudentsForWeek();
}

function saveStudents() {
  saveStudentsForWeek();
}

function getCurrentLevel(points) {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].points) {
      return levels[i];
    }
  }
  return levels[0];
}

// Hàm lấy màu cho điểm số: đỏ nếu âm, xanh lá nếu dương hoặc bằng 0
function getPointColor(points) {
  if (points < 0) {
    return "#f44336"; // Màu đỏ cho điểm âm
  } else {
    return "#4caf50"; // Màu xanh lá cho điểm dương hoặc bằng 0
  }
}

function getNextLevel(points) {
  for (let i = 0; i < levels.length; i++) {
    if (points < levels[i].points) {
      return levels[i];
    }
  }
  return levels[levels.length - 1];
}

function getProgressPercentage(points) {
  // Nếu điểm âm, trả về 0%
  if (points < 0) {
    return 0;
  }

  const currentLevel = getCurrentLevel(points);
  const nextLevel = getNextLevel(points);

  if (nextLevel.points === currentLevel.points) {
    return 100;
  }

  const progress =
    ((points - currentLevel.points) /
      (nextLevel.points - currentLevel.points)) *
    100;
  return Math.min(100, Math.max(0, progress));
}

// Base64 Images - Để nhúng ảnh trực tiếp vào HTML
const base64Images = {
  "Dân thường": "", // Thay bằng: data:image/png;base64,iVBORw0KGgo...
  Lính: "",
  Quan: "",
  "Tể tướng": "",
  Vua: "",
};

function getLevelImage(levelName) {
  // Nếu có base64, dùng base64. Nếu không, dùng file path
  if (base64Images[levelName]) {
    return base64Images[levelName];
  }

  // Fallback về file path
  const imageMap = {
    "Dân thường": "data/dan.png",
    Lính: "data/linh.png",
    Quan: "data/quan.png",
    "Tể tướng": "data/tetuong.png",
    Vua: "data/vua.png",
  };
  return imageMap[levelName] || "data/dan.png";
}

function getLevelGradient(levelName) {
  const gradients = {
    "Dân thường": "linear-gradient(90deg, #95a5a6, #bdc3c7, #ecf0f1)", // Xám nhạt
    Lính: "linear-gradient(90deg, #3498db, #5dade2, #85c1e9)", // Xanh dương
    Quan: "linear-gradient(90deg, #9b59b6, #bb8fce, #d7bde2)", // Tím
    "Tể tướng": "linear-gradient(90deg, #e67e22, #f39c12, #f7dc6f)", // Cam vàng
    Vua: "linear-gradient(90deg, #e74c3c, #f1948a, #fadbd8)", // Đỏ hồng
  };
  return gradients[levelName] || gradients["Dân thường"];
}

// Undo stack
const undoStack = [];
function pushUndo() {
  undoStack.push(JSON.stringify({ students }));
  if (undoStack.length > 20) undoStack.shift();
}
function undo() {
  if (undoStack.length === 0) return alert("Không có gì để hoàn tác.");
  const last = undoStack.pop();
  const state = JSON.parse(last);
  students = state.students;
  saveStudents();
  renderStudents();
  renderGroupGrid();
}

// Hàm highlight điểm khi cập nhật
function highlightPoints(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add("point-highlight");
    setTimeout(() => {
      element.classList.remove("point-highlight");
    }, 600);
  }
}

function updateStudentPoints(studentId, change) {
  console.log("updateStudentPoints called:", studentId, change);
  const student = students.find((s) => s.id === studentId);
  if (student) {
    pushUndo();
    const currentLevel = getCurrentLevel(student.points);
    const adjusted = Math.round(change * (currentLevel.multiplier || 1));
    const oldPoints = student.points;
    student.points = student.points + adjusted;

    // Lưu lịch sử điểm
    if (!student.history) student.history = [];
    student.history.push({
      date: new Date().toISOString(),
      points: adjusted,
      total: student.points,
    });

    // Lưu vào lịch sử tập trung
    addToHistory(
      studentId,
      student.name,
      adjusted,
      student.points,
      "individual"
    );

    console.log("Student points updated:", student.name, student.points);
    saveStudents();
    renderStudents();
    renderGroupGrid();
    renderTopStudents();
    renderTopGroups();
    updateHomeStats();
    // Highlight điểm sau khi render
    setTimeout(() => {
      highlightPoints(`points-${studentId}`);
    }, 50);
  }
}

function addPointsToAll(points) {
  pushUndo();
  const now = new Date().toISOString();
  students.forEach((student) => {
    const currentLevel = getCurrentLevel(student.points);
    const adjusted = Math.round(points * (currentLevel.multiplier || 1));
    student.points = student.points + adjusted;

    // Lưu lịch sử điểm
    if (!student.history) student.history = [];
    student.history.push({
      date: now,
      points: adjusted,
      total: student.points,
    });
  });
  saveStudents();
  renderStudents();
  renderGroupGrid();
  renderTopStudents();
  renderTopGroups();
  renderAllStudentsList();
  updateHomeStats();
}

function addPointsToGroup(points, groupId) {
  pushUndo();
  const now = new Date().toISOString();
  const grp =
    groupId === "all"
      ? null
      : groups.find((g) => String(g.id) === String(groupId));
  const targetIds = grp ? grp.studentIds : students.map((s) => s.id);

  // Cộng điểm vào nhóm (nếu là nhóm cụ thể)
  if (grp) {
    // Đảm bảo nhóm có trường points
    if (typeof grp.points === "undefined") {
      grp.points = 0;
    }
    grp.points = (grp.points || 0) + points;
    saveGroups();
  }

  // Ưu đãi nhóm: lấy hệ số cao nhất trong nhóm (Quan/Tể tướng/Vua), chỉ tính 1 lần
  let groupMultiplier = 1;
  if (grp) {
    const topMult = targetIds
      .map(
        (id) =>
          getCurrentLevel((students.find((s) => s.id === id) || {}).points || 0)
            .multiplier || 1
      )
      .reduce((m, v) => Math.max(m, v), 1);
    groupMultiplier = Math.max(1, topMult);
  }
  const levelUpStudents = []; // Lưu danh sách học sinh lên cấp
  students.forEach((student) => {
    if (targetIds.includes(student.id)) {
      // Lưu level trước khi cộng điểm
      const oldLevel = getCurrentLevel(student.points);
      const selfMult = getCurrentLevel(student.points).multiplier || 1;
      // Chỉ áp dụng hệ số khi các thành viên có chức vụ cao
      const adjusted = Math.round(points * Math.max(selfMult, groupMultiplier));

      // Cộng điểm
      student.points = student.points + adjusted;

      // Kiểm tra level sau khi cộng điểm
      const newLevel = getCurrentLevel(student.points);

      // Kiểm tra xem có lên cấp không
      if (oldLevel.name !== newLevel.name) {
        levelUpStudents.push({
          id: student.id,
          name: student.name,
          newLevel: newLevel.name,
        });
      }

      // Lưu lịch sử điểm
      if (!student.history) student.history = [];
      student.history.push({
        date: now,
        points: adjusted,
        total: student.points,
      });

      // Lưu vào lịch sử tập trung
      addToHistory(
        student.id,
        student.name,
        adjusted,
        student.points,
        grp ? "group" : "bulk"
      );
    }
  });
  saveStudents();
  renderStudents();
  renderGroupGrid();
  renderGroupsGrid();
  renderTopStudents();
  renderTopGroups();
  updateHomeStats();

  // Phát âm thanh khi cộng hoặc trừ điểm cho nhóm
  if (points > 0) {
    playGameSound("success");
  } else if (points < 0) {
    playGameSound("click");
  }

  // Hiển thị thông báo chúc mừng cho học sinh lên cấp
  if (levelUpStudents.length > 0 && points > 0) {
    playGameSound("levelup");
    showMultipleLevelUpNotifications(levelUpStudents);
  }

  // Cập nhật modal nếu đang mở
  const groupModal = document.getElementById("groupStudentsModal");
  if (groupModal && groupModal.style.display === "flex" && grp) {
    renderGroupStudents(grp.id);
  }

  // Highlight điểm trên thẻ nhóm sau khi render
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (grp) {
        // Highlight điểm trên thẻ nhóm
        const groupPointsElement = document.getElementById(
          `group-points-${grp.id}`
        );
        if (groupPointsElement) {
          highlightPoints(`group-points-${grp.id}`);
        }
      } else {
        // Nếu cộng cho tất cả, highlight tất cả thẻ nhóm
        groups.forEach((g) => {
          const groupPointsElement = document.getElementById(
            `group-points-${g.id}`
          );
          if (groupPointsElement) {
            highlightPoints(`group-points-${g.id}`);
          }
        });
      }
    }, 100);
  });
}

function resetAllPoints() {
  if (confirm("Bạn có chắc chắn muốn reset tất cả điểm số?")) {
    students.forEach((student) => {
      student.points = 0;
    });
    // Reset điểm nhóm về 0
    groups.forEach((group) => {
      group.points = 0;
    });
    saveStudents();
    saveGroups();
    renderStudents();
    renderGroupGrid();
    renderGroupsGrid();
    renderTopStudents();
    renderTopGroups();
    updateHomeStats();
  }
}

function handleAddMultipleStudents(textareaId = "bulkStudentNames") {
  const textarea = document.getElementById(textareaId);
  const lines = (textarea.value || "")
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length === 0) return alert("Nhập ít nhất một tên học sinh.");
  const maxId = students.reduce((m, s) => Math.max(m, s.id), 0);
  let nextId = maxId + 1;
  lines.forEach((name) => {
    students.push({ id: nextId++, name, points: 0 });
  });
  textarea.value = "";
  saveStudents();
  renderStudents();
  renderGroupSelects();
  renderGroupGrid();
}

function clearAllStudents() {
  if (!confirm("Bạn chắc chắn muốn xóa toàn bộ học sinh?")) return;
  students = [];
  saveStudents();
  renderStudents();
  renderGroupSelects();
  renderGroupGrid();
}

// Hàm sắp xếp học sinh theo TÊN (từ cuối cùng)
// Ví dụ: "Lý Lâm Vy Thảo" -> sắp xếp theo "Thảo" (tên), không phải "Lý" (họ)
function sortStudentsByLastName(a, b) {
  // Lấy TÊN (từ cuối cùng) của học sinh
  const getLastName = (name) => {
    if (!name || typeof name !== "string") return "";
    // Loại bỏ khoảng trắng đầu cuối, normalize chuỗi
    const trimmed = name.trim();
    if (!trimmed) return "";
    // Tách theo khoảng trắng (một hoặc nhiều khoảng trắng)
    const words = trimmed
      .split(/\s+/)
      .filter((word) => word && word.length > 0);
    // Lấy từ cuối cùng (TÊN) trong mảng
    // Ví dụ: "Lý Lâm Vy Thảo" -> ["Lý", "Lâm", "Vy", "Thảo"] -> lấy "Thảo"
    if (words.length === 0) return trimmed;
    const lastWord = words[words.length - 1];
    return lastWord ? lastWord.trim() : trimmed;
  };

  const lastNameA = getLastName(a.name);
  const lastNameB = getLastName(b.name);

  // So sánh theo TÊN (từ cuối), nếu giống nhau thì so sánh toàn bộ tên
  const compare = lastNameA.localeCompare(lastNameB, "vi", {
    sensitivity: "base",
  });
  const result = compare !== 0 ? compare : a.name.localeCompare(b.name, "vi");

  // Debug log để kiểm tra (có thể xóa sau)
  if (Math.random() < 0.01) {
    // Chỉ log 1% để không spam console
    console.log(
      `Sort: "${a.name}" -> last word: "${lastNameA}" | "${b.name}" -> last word: "${lastNameB}" | result: ${result}`
    );
  }

  return result;
}

function renderStudents() {
  console.log("renderStudents called");
  const grid = document.getElementById("studentGrid");
  if (!grid) {
    console.error("studentGrid not found");
    return;
  }

  // Đảm bảo có style tag cho màu điểm với specificity cực cao
  if (!document.getElementById("student-points-color-style")) {
    const styleTag = document.createElement("style");
    styleTag.id = "student-points-color-style";
    styleTag.textContent = `
                /* CSS với specificity cực cao để override mọi CSS khác */
                .student-card div[id^="points-"].points-negative,
                .student-card .student-points-display.points-negative,
                div.student-card div[id^="points-"][class*="points-negative"],
                body .student-card div[id^="points-"].points-negative {
                    color: #f44336 !important;
                }
                .student-card div[id^="points-"].points-positive,
                .student-card .student-points-display.points-positive,
                div.student-card div[id^="points-"][class*="points-positive"],
                body .student-card div[id^="points-"].points-positive {
                    color: #4caf50 !important;
                }
            `;
    document.head.appendChild(styleTag);
  }

  // Thay đổi layout thành grid 6 cột
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(6, 1fr)";
  grid.style.gap = "20px";
  grid.innerHTML = "";

  // Sắp xếp theo từ cuối của tên
  const sortedStudents = [...students].sort(sortStudentsByLastName);
  console.log("Students to render:", sortedStudents.length);

  sortedStudents.forEach((student) => {
    const currentLevel = getCurrentLevel(student.points);
    const nextLevel = getNextLevel(student.points);
    const progress = getProgressPercentage(student.points);
    // Tính toán màu: đỏ nếu điểm âm, xanh lá nếu điểm dương
    const pointColor = student.points < 0 ? "#f44336" : "#4caf50";
    console.log(
      "Rendering student:",
      student.name,
      "points:",
      student.points,
      "color:",
      pointColor
    );

    const studentCard = document.createElement("div");
    studentCard.className = "student-card";
    studentCard.innerHTML = `
                <div class="student-name" style="margin-bottom:8px;">${
                  student.name
                }</div>
                <div class="character-level">
                    <div class="character-image" style="background: ${
                      currentLevel.color
                    }">
                        <img src="${getLevelImage(currentLevel.name)}" alt="${
      currentLevel.name
    }" style="width: 82px; height: 82px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <span style="display: none;">${currentLevel.icon}</span>
                    </div>
                    <div class="level-name">${currentLevel.name}</div>
                </div>
                <div id="points-${
                  student.id
                }" style="font-size: 1rem; font-weight: bold; margin: 4px 0; text-align: center; color: ${pointColor};">${
      student.points
    } điểm</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%; background: ${getLevelGradient(
      currentLevel.name
    )}">
                        <div class="progress-text">${Math.round(
                          progress
                        )}%</div>
                    </div>
                </div>
                <div class="controls" style="gap:5px; display:flex; justify-content:center; align-items:center;">
                    <button class="btn btn-add" onclick="applyAmount(${
                      student.id
                    }, true)" style="padding:5px 10px; font-size:0.85rem; order:1;">+</button>
                    <input type="number" id="amount-${
                      student.id
                    }" value="1" min="1" step="1" style="width:75px; padding:5px 6px; border-radius:6px; border:1px solid #eee; text-align:center; font-size:0.85rem; order:2; cursor: text; background: white;" onfocus="console.log('Input focused:', ${
      student.id
    })" onchange="console.log('Input changed:', ${
      student.id
    }, this.value)" onclick="console.log('Input clicked:', ${
      student.id
    })" onkeydown="console.log('Input keydown:', ${
      student.id
    }, event.key)" onkeyup="console.log('Input keyup:', ${
      student.id
    }, event.key)" />
                    <button class="btn btn-subtract" onclick="applyAmount(${
                      student.id
                    }, false)" style="padding:5px 10px; font-size:0.85rem; order:3;">-</button>
                </div>
            `;

    grid.appendChild(studentCard);

    // Set màu điểm ngay sau khi append vào DOM - dùng nhiều cách để đảm bảo
    const pointsElement = document.getElementById("points-" + student.id);
    if (pointsElement) {
      // Set màu: đỏ nếu điểm âm, xanh lá nếu điểm dương
      const colorValue = student.points < 0 ? "#f44336" : "#4caf50";

      // Function để force set màu
      const forceSetColor = () => {
        pointsElement.style.removeProperty("color");
        pointsElement.style.setProperty("color", colorValue, "important");
        // Kiểm tra computed style và set lại nếu cần
        const computedColor = window.getComputedStyle(pointsElement).color;
        if (
          computedColor !== "rgb(244, 67, 54)" &&
          computedColor !== "rgb(76, 175, 80)"
        ) {
          pointsElement.style.setProperty("color", colorValue, "important");
        }
      };

      // Set ngay lập tức
      forceSetColor();

      // Set lại sau khi render
      requestAnimationFrame(() => {
        forceSetColor();
      });

      // Set lại sau một chút để override mọi CSS khác
      setTimeout(() => {
        forceSetColor();
        // Force reflow
        pointsElement.offsetHeight;
        forceSetColor();
      }, 10);

      // Dùng MutationObserver để theo dõi và force set màu mỗi khi có thay đổi
      const observer = new MutationObserver(() => {
        forceSetColor();
      });
      observer.observe(pointsElement, {
        attributes: true,
        attributeFilter: ["style", "class"],
        childList: false,
        subtree: false,
      });
    }

    // Thêm event listener để đảm bảo input hoạt động
    const input = document.getElementById(`amount-${student.id}`);
    if (input) {
      input.addEventListener("focus", function () {
        console.log("Input focused via addEventListener:", student.id);
        this.select();
      });
      input.addEventListener("input", function () {
        console.log(
          "Input changed via addEventListener:",
          student.id,
          this.value
        );
      });
      input.addEventListener("click", function () {
        console.log("Input clicked via addEventListener:", student.id);
        this.select();
      });
    }
  });

  updateHomeStats();
  renderMembersList();
  renderTopStudents();
  renderTopGroups();
  renderAllStudentsList();
  console.log("renderStudents completed");
}

function applyAmount(studentId, isAdd) {
  console.log("applyAmount called:", studentId, isAdd);
  const input = document.getElementById(`amount-${studentId}`);
  if (!input) {
    console.error("Input not found for student:", studentId);
    return;
  }
  let value = parseInt(input.value, 10);
  if (isNaN(value) || value <= 0) value = 1;
  console.log(
    "Applying amount:",
    value,
    "to student:",
    studentId,
    "isAdd:",
    isAdd
  );
  updateStudentPoints(studentId, isAdd ? value : -value);
}

function applyCompactAmount(studentId, isAdd) {
  console.log("applyCompactAmount called:", studentId, isAdd);
  const input = document.getElementById(`compact-amount-${studentId}`);
  if (!input) {
    console.error("Input not found for student:", studentId);
    return;
  }
  let value = parseInt(input.value, 10);
  if (isNaN(value) || value <= 0) value = 1;
  console.log(
    "Applying amount:",
    value,
    "to student:",
    studentId,
    "isAdd:",
    isAdd
  );
  updateStudentPoints(studentId, isAdd ? value : -value);
}

function getAutoAmount() {
  const v = parseInt(document.getElementById("autoAmount").value, 10);
  return isNaN(v) || v <= 0 ? 1 : v;
}

function deleteStudent() {
  const select = document.getElementById("deleteStudentSelect");
  const studentId = parseInt(select.value);
  if (!studentId) {
    alert("Vui lòng chọn học sinh cần xóa!");
    return;
  }

  const student = students.find((s) => s.id === studentId);
  if (!student) {
    alert("Không tìm thấy học sinh!");
    return;
  }

  if (
    !confirm(
      `Bạn chắc chắn muốn xóa học sinh "${student.name}"?\n\nLưu ý: Việc này cũng sẽ xóa học sinh khỏi tất cả các nhóm mà học sinh tham gia.`
    )
  ) {
    return;
  }

  // Xóa học sinh khỏi danh sách
  students = students.filter((s) => s.id !== studentId);

  // Xóa học sinh khỏi tất cả nhóm
  groups.forEach((group) => {
    group.studentIds = group.studentIds.filter((id) => id !== studentId);
  });

  // Lưu dữ liệu
  saveStudents();
  saveGroups();

  // Cập nhật giao diện
  renderStudents();
  renderGroupSelects();
  renderGroupGrid();
  renderTopStudents();
  renderTopGroups();
  updateDeleteStudentSelect();
  updateHomeStats();

  alert(`Đã xóa học sinh "${student.name}" thành công!`);
  select.value = "";
}

function updateDeleteStudentSelect() {
  const select = document.getElementById("deleteStudentSelect");
  if (!select) return;

  const currentValue = select.value;
  select.innerHTML = '<option value="">-- Chọn học sinh cần xóa --</option>';

  students.forEach((student) => {
    const option = document.createElement("option");
    option.value = student.id;
    option.textContent = `${student.name} - ${
      getCurrentLevel(student.points).name
    } - ${student.points} điểm`;
    select.appendChild(option);
  });

  // Giữ lại giá trị đã chọn nếu vẫn tồn tại
  if (currentValue && students.find((s) => s.id === parseInt(currentValue))) {
    select.value = currentValue;
  }
}

function showTab(tabName) {
  // Reset danh sách loại trừ khi chuyển tab (trừ khi chuyển sang tab features)
  if (tabName !== "features") {
    calledStudentIds.clear();
  }

  // Ẩn tất cả tab
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".nav-icon").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Hiển thị tab được chọn
  document.getElementById(tabName + "-tab").classList.add("active");

  // Tìm và active icon tương ứng
  const iconMap = {
    home: "🏠",
    students: "👥",
    groups: "📊",
    features: "⚡",
    rewards: "🎁",
    reports: "📈",
    settings: "⚙️",
  };

  if (iconMap[tabName]) {
    const targetIcon = Array.from(document.querySelectorAll(".nav-icon")).find(
      (icon) => {
        const span = icon.querySelector("span");
        return span && span.textContent.includes(iconMap[tabName]);
      }
    );
    if (targetIcon) {
      targetIcon.classList.add("active");
    }
  }

  // Render nội dung tương ứng
  if (tabName === "home") {
    renderTopStudents();
    renderTopGroups();
  }

  // Cập nhật header
  const titles = {
    home: { title: "Trang chủ", subtitle: "Tổng quan lớp học" },
    students: { title: "Học sinh", subtitle: "Quản lý học sinh" },
    groups: { title: "Nhóm", subtitle: "Quản lý nhóm học tập" },
    features: { title: "Tính năng", subtitle: "Công cụ bổ trợ" },
    rewards: { title: "Đổi quà", subtitle: "Vật phẩm theo cấp bậc" },
    settings: { title: "Cài đặt", subtitle: "Quản lý hệ thống" },
    reports: { title: "Báo cáo", subtitle: "Thống kê và xuất dữ liệu" },
  };

  document.getElementById("headerTitle").textContent = titles[tabName].title;
  document.getElementById("headerSubtitle").textContent =
    titles[tabName].subtitle;

  // Hiển thị/ẩn search box
  document.getElementById("searchBox").style.display =
    tabName === "students" ? "block" : "none";

  // Render nội dung tương ứng
  if (tabName === "home") {
    updateHomeStats();
    renderTopStudents();
    renderTopGroups();
  } else if (tabName === "students") {
    console.log("Switching to students tab");
    renderStudents();
    updateHomeStats();
    console.log("Students tab rendered with renderStudents()");
  } else if (tabName === "groups") {
    renderGroupsGrid();
  } else if (tabName === "features") {
    // Không cần render gì
  } else if (tabName === "rewards") {
    renderRewardsGrid();
  } else if (tabName === "settings") {
    buildThresholdEditor();
    buildThresholdTable();
  } else if (tabName === "reports") {
    // Không cần render gì
  }
}

// Giao diện nhóm giống bảng chính
function renderGroupGrid() {
  const groupGrid = document.getElementById("groupGrid");
  const groupSelect = document.getElementById("groupActionSelect");
  if (!groupGrid || !groupSelect) return;
  groupSelect.innerHTML = groups
    .map((g) => `<option value="${g.id}">${g.name}</option>`)
    .join("");
  const selectedId = parseInt(groupSelect.value || groups[0]?.id || 0, 10);
  const grp = groups.find((g) => g.id === selectedId);
  groupGrid.innerHTML = "";
  const memberIds = grp ? grp.studentIds : [];
  const members = students
    .filter((s) => memberIds.includes(s.id))
    .sort(sortStudentsByLastName);
  members.forEach((student) => {
    const currentLevel = getCurrentLevel(student.points);
    const progress = getProgressPercentage(student.points);
    const card = document.createElement("div");
    card.className = "student-card";
    card.innerHTML = `
                <div style="display:flex; justify-content: space-between; align-items:center; gap:8px;">
                    <div class="student-name" style="margin-bottom:0;">${
                      student.name
                    }</div>
                </div>
                <div class="character-level">
                    <div class="character-image" style="background: ${
                      currentLevel.color
                    }">
                        <img src="${getLevelImage(currentLevel.name)}" alt="${
      currentLevel.name
    }" style="width: 120px; height: 120px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <span style="display: none;">${currentLevel.icon}</span>
                    </div>
                    <div class="level-name">${currentLevel.name}</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%; background: ${getLevelGradient(
      currentLevel.name
    )}"><div class="progress-text">${Math.round(progress)}%</div></div>
                </div>
                <div class="controls" style="gap:6px;">
                    <input type="number" id="gamount-${
                      student.id
                    }" value="1" min="1" style="width:80px; padding:8px 10px; border-radius:12px; border:1px solid #eee; text-align:center;" />
                    <button class="btn btn-add" onclick="applyAmount(${
                      student.id
                    }, true)">Cộng</button>
                    <button class="btn btn-subtract" onclick="applyAmount(${
                      student.id
                    }, false)">Trừ</button>
                </div>`;
    groupGrid.appendChild(card);
  });
}

function applyGroupAction(isAdd) {
  const amt =
    parseInt(document.getElementById("groupAutoAmount").value, 10) || 1;
  const gid = document.getElementById("groupActionSelect").value;
  addPointsToGroup(isAdd ? amt : -amt, gid);
}

function togglePanel(btn) {
  document.getElementById("quickPanel").classList.toggle("open");
}

// Settings modal
function openSettings() {
  console.log("Opening settings modal...");
  document.getElementById("settingsModal").style.display = "flex";
  buildThresholdEditor();
  buildThresholdTable();
  loadCriteriaDisplay();
  console.log("Settings modal opened successfully");
}
function closeSettings() {
  document.getElementById("settingsModal").style.display = "none";
}
function buildThresholdEditor() {
  const host = document.getElementById("thresholdEditor");
  host.innerHTML = levels
    .map(
      (lv, idx) => `
            <div style=\"display:flex; align-items:center; gap:8px; margin-bottom:8px;\">
                <div style=\"width:110px; font-weight:700;\">${lv.name}</div>
                <input type=\"number\" min=\"0\" value=\"${
                  lv.points
                }\" id=\"th-${idx}\" style=\"flex:1; padding:8px; border-radius:10px; border:1px solid #eee;\" />
                <span style=\"color:#777;\">Hệ số:</span>
                <input type=\"number\" step=\"0.25\" min=\"1\" value=\"${
                  lv.multiplier || 1
                }\" id=\"mul-${idx}\" style=\"width:90px; padding:8px; border-radius:10px; border:1px solid #eee;\" />
            </div>`
    )
    .join("");
}

// Hiển thị danh sách tiêu chí
function loadCriteriaDisplay() {
  console.log("loadCriteriaDisplay called");
  console.log("criteriaData:", criteriaData);

  // Hiển thị điểm cộng
  const addContainer = document.getElementById("addCriteriaContainer");
  console.log("addContainer:", addContainer);
  if (addContainer && criteriaData.add) {
    if (criteriaData.add.length === 0) {
      addContainer.innerHTML =
        '<div style="text-align: center; padding: 20px; color: #666;">Chưa có tiêu chí nào</div>';
    } else {
      addContainer.innerHTML = criteriaData.add
        .map(
          (item, idx) => `
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e0e0e0;">
                        <select onchange="updateCriteriaIcon('add', ${idx}, this.value)" style="width: 70px; padding: 8px; border-radius: 6px; border: 1px solid #ddd; font-size: 1.3rem; background: white;">
                            <option value="⭐" ${
                              item.icon === "⭐" ? "selected" : ""
                            }>⭐</option>
                            <option value="🏆" ${
                              item.icon === "🏆" ? "selected" : ""
                            }>🏆</option>
                            <option value="🎯" ${
                              item.icon === "🎯" ? "selected" : ""
                            }>🎯</option>
                            <option value="💡" ${
                              item.icon === "💡" ? "selected" : ""
                            }>💡</option>
                            <option value="🔥" ${
                              item.icon === "🔥" ? "selected" : ""
                            }>🔥</option>
                            <option value="⚡" ${
                              item.icon === "⚡" ? "selected" : ""
                            }>⚡</option>
                        </select>
                        <input type="text" onchange="updateCriteriaContent('add', ${idx}, this.value)" value="${
            item.content
          }" placeholder="Nhập tiêu chí..." style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #ddd; font-size: 0.95rem;" />
                        <input type="number" onchange="updateCriteriaPoints('add', ${idx}, this.value)" value="${
            item.points
          }" min="1" style="width: 70px; padding: 10px; border-radius: 6px; border: 1px solid #ddd; text-align: center; font-size: 0.95rem;" />
                        <button onclick="deleteCriteriaItem('add', ${idx})" style="background: #ff6b6b; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1.2rem;">×</button>
                    </div>
                `
        )
        .join("");
    }
  }

  // Hiển thị điểm trừ
  const subtractContainer = document.getElementById(
    "subtractCriteriaContainer"
  );
  if (subtractContainer && criteriaData.subtract) {
    if (criteriaData.subtract.length === 0) {
      subtractContainer.innerHTML =
        '<div style="text-align: center; padding: 20px; color: #666;">Chưa có tiêu chí nào</div>';
    } else {
      subtractContainer.innerHTML = criteriaData.subtract
        .map(
          (item, idx) => `
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e0e0e0;">
                        <select onchange="updateCriteriaIcon('subtract', ${idx}, this.value)" style="width: 70px; padding: 8px; border-radius: 6px; border: 1px solid #ddd; font-size: 1.3rem; background: white;">
                            <option value="❌" ${
                              item.icon === "❌" ? "selected" : ""
                            }>❌</option>
                            <option value="⚠️" ${
                              item.icon === "⚠️" ? "selected" : ""
                            }>⚠️</option>
                            <option value="🚫" ${
                              item.icon === "🚫" ? "selected" : ""
                            }>🚫</option>
                            <option value="💥" ${
                              item.icon === "💥" ? "selected" : ""
                            }>💥</option>
                            <option value="🔥" ${
                              item.icon === "🔥" ? "selected" : ""
                            }>🔥</option>
                            <option value="⚡" ${
                              item.icon === "⚡" ? "selected" : ""
                            }>⚡</option>
                        </select>
                        <input type="text" onchange="updateCriteriaContent('subtract', ${idx}, this.value)" value="${
            item.content
          }" placeholder="Nhập tiêu chí..." style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #ddd; font-size: 0.95rem;" />
                        <input type="number" onchange="updateCriteriaPoints('subtract', ${idx}, this.value)" value="${
            item.points
          }" min="1" style="width: 70px; padding: 10px; border-radius: 6px; border: 1px solid #ddd; text-align: center; font-size: 0.95rem;" />
                        <button onclick="deleteCriteriaItem('subtract', ${idx})" style="background: #ff6b6b; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1.2rem;">×</button>
                    </div>
                `
        )
        .join("");
    }
  }
}

// Thêm tiêu chí mới
function addNewCriteria(type) {
  if (type === "add") {
    criteriaData.add.push({ icon: "⭐", content: "", points: 1 });
  } else {
    criteriaData.subtract.push({ icon: "❌", content: "", points: 1 });
  }
  saveCriteriaData();
  loadCriteriaDisplay();
}

// Xóa tiêu chí
function deleteCriteriaItem(type, idx) {
  if (confirm("Bạn có chắc chắn muốn xóa tiêu chí này?")) {
    criteriaData[type].splice(idx, 1);
    saveCriteriaData();
    loadCriteriaDisplay();
  }
}

// Cập nhật icon
function updateCriteriaIcon(type, idx, value) {
  criteriaData[type][idx].icon = value;
  saveCriteriaData();
}

// Cập nhật nội dung
function updateCriteriaContent(type, idx, value) {
  criteriaData[type][idx].content = value;
  saveCriteriaData();
}

// Cập nhật điểm
function updateCriteriaPoints(type, idx, value) {
  criteriaData[type][idx].points = parseInt(value) || 1;
  saveCriteriaData();
}

// Lưu tất cả
function saveAllCriteria() {
  saveCriteriaData();
  alert("✅ Đã lưu thành công!");
  loadCriteriaDisplay();
}

function showPointBoard() {
  document.getElementById("pointBoardModal").style.display = "flex";
  loadPointBoardDisplay();
}

function closePointBoardModal() {
  document.getElementById("pointBoardModal").style.display = "none";
}

function switchPointBoardTab(tab) {
  const addTab = document.getElementById("pointBoardAddTab");
  const subtractTab = document.getElementById("pointBoardSubtractTab");
  const addContent = document.getElementById("pointBoardAddContent");
  const subtractContent = document.getElementById("pointBoardSubtractContent");

  if (tab === "add") {
    addTab.style.background = "#28a745";
    subtractTab.style.background = "#6c757d";
    addContent.style.display = "grid";
    subtractContent.style.display = "none";
  } else {
    addTab.style.background = "#6c757d";
    subtractTab.style.background = "#dc3545";
    addContent.style.display = "none";
    subtractContent.style.display = "grid";
  }
}

function loadPointBoardDisplay() {
  // Hiển thị điểm cộng
  const addContent = document.getElementById("pointBoardAddContent");
  if (addContent && criteriaData.add) {
    addContent.innerHTML = criteriaData.add
      .map(
        (item, index) => `
                <div style="
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    transition: all 0.3s ease;
                    cursor: pointer;
                    min-height: 120px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.25)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'" onclick="applyCriteriaPoint('add', ${index})">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">${item.icon}</div>
                    <h4 style="margin: 0 0 10px; color: #333; font-size: 0.9rem; font-weight: 600; line-height: 1.3; min-height: 35px;">${item.content}</h4>
                    <div style="background: #28a745; color: white; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 0.8rem; display: inline-block;">+${item.points}</div>
                </div>
            `
      )
      .join("");
  }

  // Hiển thị điểm trừ
  const subtractContent = document.getElementById("pointBoardSubtractContent");
  if (subtractContent && criteriaData.subtract) {
    subtractContent.innerHTML = criteriaData.subtract
      .map(
        (item, index) => `
                <div style="
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    transition: all 0.3s ease;
                    cursor: pointer;
                    min-height: 120px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.25)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'" onclick="applyCriteriaPoint('subtract', ${index})">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">${item.icon}</div>
                    <h4 style="margin: 0 0 10px; color: #333; font-size: 0.9rem; font-weight: 600; line-height: 1.3; min-height: 35px;">${item.content}</h4>
                    <div style="background: #dc3545; color: white; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 0.8rem; display: inline-block;">-${item.points}</div>
                                </div>
            `
      )
      .join("");
  }
}

function applyCriteriaPoint(type, index) {
  const item =
    type === "add" ? criteriaData.add[index] : criteriaData.subtract[index];
  if (!item) return;

  if (
    confirm(
      `Áp dụng "${item.content}" (${type === "add" ? "+" : "-"}${
        item.points
      } điểm) cho tất cả học sinh?`
    )
  ) {
    pushUndo();
    const now = new Date().toISOString();
    students.forEach((student) => {
      const currentLevel = getCurrentLevel(student.points);
      const adjusted = Math.round(
        (type === "add" ? item.points : -item.points) *
          (currentLevel.multiplier || 1)
      );
      student.points = student.points + adjusted;

      if (!student.history) student.history = [];
      student.history.push({
        date: now,
        points: adjusted,
        total: student.points,
        reason: item.content,
      });
    });
    saveStudents();
    renderStudents();
    renderGroupGrid();
    renderTopStudents();
    renderTopGroups();
    updateHomeStats();
    closePointBoardModal();
    alert(`Đã áp dụng "${item.content}" cho tất cả học sinh!`);
  }
}
function buildThresholdTable() {
  const host = document.getElementById("thresholdTableBody");
  if (!host) return;
  host.innerHTML = levels
    .map(
      (lv) => `
            <tr>
                <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold; color: ${
                  lv.color
                };">${lv.name}</td>
                <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">${
                  lv.points
                } điểm</td>
                <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">x${
                  lv.multiplier || 1
                }</td>
            </tr>
        `
    )
    .join("");
}
function saveThresholds() {
  levels = levels.map((lv, idx) => ({
    ...lv,
    points: Math.max(
      0,
      parseInt(document.getElementById(`th-${idx}`).value, 10) || 0
    ),
    multiplier: Math.max(
      1,
      parseFloat(document.getElementById(`mul-${idx}`).value) || 1
    ),
  }));
  saveLevels();
  buildThresholdTable();
  renderStudents();
  renderGroupGrid();
}

// Hàm render vật phẩm đổi quà
function renderRewardsGrid() {
  const grid = document.getElementById("rewardsGrid");
  if (!grid) return;

  grid.innerHTML = "";
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))";
  grid.style.gap = "20px";

  levels.forEach((level) => {
    const reward = rewardItems.find((r) => r.level === level.name) || {
      itemName: "Chưa cài đặt",
      itemImage: "",
      description: "",
    };

    const card = document.createElement("div");
    card.className = "student-card";
    card.innerHTML = `
                <div class="student-name" style="margin-bottom:15px; text-align: center;">
                    <img src="${getLevelImage(level.name)}" alt="${
      level.name
    }" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 5px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                    <span style="display: none;">${level.icon}</span>
                    ${level.name}
                </div>
                <div class="character-level">
                    <div class="character-image" style="background: ${
                      level.color
                    }">
                        ${
                          reward.itemImage
                            ? `<img src="${reward.itemImage}" alt="${reward.itemName}" style="width: 60px; height: 60px; object-fit: contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">`
                            : ""
                        }
                        <span style="${
                          reward.itemImage ? "display: none;" : ""
                        } font-size: 2.5rem;">🎁</span>
                    </div>
                    <div class="level-name" style="margin-top: 15px; font-size: 1.1rem;">${
                      reward.itemName
                    }</div>
                    <div style="font-size: 0.9rem; color: #666; margin-top: 8px; text-align: center;">${
                      reward.description
                    }</div>
                </div>
                <div style="text-align: center; margin-top: 15px; padding: 12px; background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 182, 193, 0.1)); border-radius: 12px;">
                    <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">Điểm yêu cầu:</div>
                    <div style="font-size: 1.3rem; font-weight: bold; background: linear-gradient(135deg, #FFD700 0%, #FF6B9D 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">
                        ${level.points} điểm
                    </div>
                </div>
            `;
    grid.appendChild(card);
  });
}

// Hàm build editor cho vật phẩm đổi quà
function buildRewardItemsEditor() {
  console.log("🔧 buildRewardItemsEditor called");
  const editor = document.getElementById("rewardItemsEditor");
  if (!editor) {
    console.error("❌ rewardItemsEditor element not found!");
    alert("Lỗi: Không tìm thấy editor! Vui lòng refresh trang.");
    return;
  }

  editor.innerHTML = "";
  console.log("📋 Building editor for", levels.length, "levels");

  levels.forEach((level, idx) => {
    const reward = rewardItems.find((r) => r.level === level.name) || {
      itemName: "",
      itemImage: "",
      description: "",
    };

    const container = document.createElement("div");
    container.style.cssText = `
                background: white; 
                padding: 20px; 
                border-radius: 12px; 
                margin-bottom: 20px; 
                border: 3px solid ${level.color};
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            `;

    const header = document.createElement("div");
    header.style.cssText =
      "display: flex; align-items: center; gap: 10px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #f0f0f0;";
    header.innerHTML = `
                <img src="${getLevelImage(level.name)}" alt="${
      level.name
    }" style="width: 40px; height: 40px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                <span style="display: none; font-size: 1.8rem;">${
                  level.icon
                }</span>
                <div style="font-weight: 800; color: #333; font-size: 1.2rem;">${
                  level.name
                }</div>
            `;

    // Tên vật phẩm
    const nameField = document.createElement("div");
    nameField.style.marginBottom = "15px";
    nameField.innerHTML =
      '<label style="display: block; font-weight: 700; margin-bottom: 8px; font-size: 1rem; color: #444;">📦 Tên vật phẩm:</label>';
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = `reward-name-${idx}`;
    nameInput.value = reward.itemName;
    nameInput.placeholder = "VD: Túi gạo 5kg, Bộ bút viết cao cấp...";
    nameInput.style.cssText =
      "width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #ddd; font-size: 1rem; transition: border 0.3s;";
    nameInput.onfocus = function () {
      this.style.border = "2px solid #FFCA28";
    };
    nameInput.onblur = function () {
      this.style.border = "2px solid #ddd";
    };
    nameField.appendChild(nameInput);

    // URL hình ảnh
    const imageField = document.createElement("div");
    imageField.style.marginBottom = "15px";
    imageField.innerHTML =
      '<label style="display: block; font-weight: 700; margin-bottom: 8px; font-size: 1rem; color: #444;">🖼️ Hình ảnh vật phẩm:</label>';

    // Container cho input và nút
    const imageInputContainer = document.createElement("div");
    imageInputContainer.style.cssText =
      "display: flex; gap: 10px; align-items: stretch;";

    const imageInput = document.createElement("input");
    imageInput.type = "text";
    imageInput.id = `reward-image-${idx}`;
    imageInput.value = reward.itemImage;
    imageInput.placeholder = "Nhập URL hoặc chọn ảnh từ máy tính...";
    imageInput.style.cssText =
      "flex: 1; padding: 12px; border-radius: 8px; border: 2px solid #ddd; font-size: 0.95rem; transition: border 0.3s;";
    imageInput.onfocus = function () {
      this.style.border = "2px solid #FFCA28";
    };
    imageInput.onblur = function () {
      this.style.border = "2px solid #ddd";
    };

    // Hidden file input
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = `reward-file-${idx}`;
    fileInput.accept = "image/png,image/jpeg,image/jpg,image/webp,image/gif";
    fileInput.style.display = "none";
    fileInput.onchange = function (e) {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 500000) {
          // 500KB
          alert("⚠️ Ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 500KB");
          return;
        }
        const reader = new FileReader();
        reader.onload = function (event) {
          imageInput.value = event.target.result;
          // Update preview nếu có
          const preview = document.getElementById(`preview-${idx}`);
          if (preview) {
            preview.src = event.target.result;
            preview.style.display = "block";
          }
          alert("✅ Đã tải ảnh thành công!");
        };
        reader.readAsDataURL(file);
      }
    };

    // Browse button
    const browseBtn = document.createElement("button");
    browseBtn.type = "button";
    browseBtn.innerHTML = "📁 Chọn ảnh";
    browseBtn.style.cssText =
      "background: linear-gradient(45deg, #42A5F5, #5dade2); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; white-space: nowrap; transition: all 0.3s;";
    browseBtn.onmouseover = function () {
      this.style.transform = "scale(1.05)";
    };
    browseBtn.onmouseout = function () {
      this.style.transform = "scale(1)";
    };
    browseBtn.onclick = function () {
      fileInput.click();
    };

    imageInputContainer.appendChild(imageInput);
    imageInputContainer.appendChild(browseBtn);
    imageInputContainer.appendChild(fileInput);
    imageField.appendChild(imageInputContainer);

    // Preview image
    const previewContainer = document.createElement("div");
    previewContainer.style.cssText = "margin-top: 10px; text-align: center;";
    const previewImg = document.createElement("img");
    previewImg.id = `preview-${idx}`;
    previewImg.style.cssText =
      "max-width: 150px; max-height: 150px; border-radius: 8px; border: 2px solid #ddd; display: " +
      (reward.itemImage ? "block" : "none") +
      "; margin: 0 auto;";
    if (reward.itemImage) {
      previewImg.src = reward.itemImage;
    }
    previewContainer.appendChild(previewImg);
    imageField.appendChild(previewContainer);

    // Mô tả
    const descField = document.createElement("div");
    descField.innerHTML =
      '<label style="display: block; font-weight: 700; margin-bottom: 8px; font-size: 1rem; color: #444;">📝 Mô tả:</label>';
    const descInput = document.createElement("input");
    descInput.type = "text";
    descInput.id = `reward-desc-${idx}`;
    descInput.value = reward.description;
    descInput.placeholder = "VD: Túi gạo ST25 thơm ngon, chất lượng cao";
    descInput.style.cssText =
      "width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #ddd; font-size: 1rem; transition: border 0.3s;";
    descInput.onfocus = function () {
      this.style.border = "2px solid #FFCA28";
    };
    descInput.onblur = function () {
      this.style.border = "2px solid #ddd";
    };
    descField.appendChild(descInput);

    container.appendChild(header);
    container.appendChild(nameField);
    container.appendChild(imageField);
    container.appendChild(descField);
    editor.appendChild(container);
  });

  console.log(
    "✅ buildRewardItemsEditor completed -",
    levels.length,
    "forms created"
  );
}

// Hàm toggle hiển thị editor
function toggleRewardEditor() {
  const container = document.getElementById("rewardEditorContainer");
  const btn = document.getElementById("toggleEditorBtn");

  if (container.style.display === "none") {
    // Hiển thị editor
    container.style.display = "block";
    btn.innerHTML = "❌ Đóng chỉnh sửa";
    btn.style.background = "linear-gradient(45deg, #ff6b6b, #ff8e8e)";
    buildRewardItemsEditor();

    // Scroll đến editor
    setTimeout(() => {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  } else {
    // Ẩn editor
    container.style.display = "none";
    btn.innerHTML = "✏️ Chỉnh sửa vật phẩm";
    btn.style.background = "linear-gradient(45deg, #6bcf7f, #4ecdc4)";
  }
}

// Hàm lưu vật phẩm đổi quà
function saveRewardItems() {
  console.log("💾 Saving reward items...");

  rewardItems = levels.map((level, idx) => {
    const name = document.getElementById(`reward-name-${idx}`)?.value || "";
    const image = document.getElementById(`reward-image-${idx}`)?.value || "";
    const desc = document.getElementById(`reward-desc-${idx}`)?.value || "";

    console.log(`📦 ${level.name}: ${name}`);

    return {
      level: level.name,
      itemName: name,
      itemImage: image,
      description: desc,
    };
  });

  localStorage.setItem("rewardItems", JSON.stringify(rewardItems));
  console.log("✅ Saved to localStorage");

  // Refresh grid
  renderRewardsGrid();

  // Thông báo thành công
  alert(
    "✅ Đã lưu thành công!\n\n" +
      "Vật phẩm đã được cập nhật.\n" +
      "Bạn có thể xem kết quả ngay bên dưới."
  );

  // Đóng editor
  toggleRewardEditor();
}

// Toggle hiển thị section Đổi điểm
function toggleExchangePointsSection() {
  const section = document.getElementById("exchangePointsSection");
  const btn = document.getElementById("toggleExchangeBtn");

  if (section.style.display === "none") {
    section.style.display = "block";
    btn.innerHTML = "❌ Đóng đổi điểm";
    btn.style.background = "linear-gradient(45deg, #ff6b6b, #ff8e8e)";
    renderExchangePointsTable();

    // Scroll đến section
    setTimeout(() => {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  } else {
    section.style.display = "none";
    btn.innerHTML = "💰 Đổi điểm";
    btn.style.background = "linear-gradient(45deg, #FFA726, #FFD54F)";
  }
}

// Render bảng danh sách đổi điểm
function renderExchangePointsTable() {
  const tbody = document.getElementById("exchangePointsTableBody");
  if (!tbody) return;

  // Sắp xếp học sinh theo điểm từ cao đến thấp
  const sortedStudents = [...students].sort((a, b) => b.points - a.points);

  tbody.innerHTML = sortedStudents
    .map((student, index) => {
      const currentLevel = getCurrentLevel(student.points);

      // Lấy danh sách quà mà học sinh có thể đổi (đủ điểm và không phải 0 điểm)
      const availableRewards = levels
        .filter((level) => student.points >= level.points && level.points > 0) // Loại bỏ quà có 0 điểm
        .map((level) => {
          const reward = rewardItems.find((r) => r.level === level.name);
          return { level: level.name, points: level.points, reward };
        })
        .sort((a, b) => b.points - a.points); // Sắp xếp từ điểm cao xuống thấp

      return `
                <tr style="border-bottom: 1px solid #eee; transition: background 0.2s;" 
                    onmouseover="this.style.background='#f8f9fa'" 
                    onmouseout="this.style.background='white'"
                    id="exchange-row-${student.id}">
                    <td style="padding: 12px 8px; text-align: center; font-weight: bold; color: #FFA726; border: 1px solid #eee; width: 50px;">
                        ${index + 1}
                    </td>
                    <td style="padding: 12px 8px; font-weight: 600; border: 1px solid #eee; width: 120px;">
                        ${student.name}
                    </td>
                    <td style="padding: 12px 8px; text-align: center; border: 1px solid #eee; width: 100px;">
                        <span style="background: ${
                          currentLevel.color
                        }; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                            ${currentLevel.name}
                        </span>
                    </td>
                    <td style="padding: 12px 8px; text-align: center; font-weight: bold; color: ${getPointColor(
                      student.points
                    )}; border: 1px solid #eee; width: 80px;">
                        ${student.points}
                    </td>
                    <td style="padding: 12px 8px; border: 1px solid #eee; width: 500px;">
                        <div id="rewards-container-${
                          student.id
                        }" style="display: flex; flex-wrap: wrap; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 8px; max-height: 150px; overflow-y: auto;">
                            ${
                              availableRewards.length > 0
                                ? availableRewards
                                    .map(
                                      ({ level, points, reward }) => `
                                <label style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; cursor: pointer; border-radius: 6px; background: white; border: 1px solid #ddd; transition: all 0.2s; white-space: nowrap;" 
                                        onmouseover="this.style.background='#e9ecef'; this.style.borderColor='#FFA726'" 
                                        onmouseout="this.style.background='white'; this.style.borderColor='#ddd'">
                                    <input type="checkbox" 
                                            id="reward-checkbox-${
                                              student.id
                                            }-${level}" 
                                            value="${level}" 
                                            data-points="${points}"
                                            onchange="updateExchangeInfo(${
                                              student.id
                                            })"
                                            style="width: 18px; height: 18px; cursor: pointer; flex-shrink: 0;">
                                    <span style="font-size: 0.85rem;">
                                        ${reward ? reward.itemName : level}
                                        <span style="color: #FFA726; font-weight: 600;">(${points})</span>
                                    </span>
                                </label>
                            `
                                    )
                                    .join("")
                                : '<div style="text-align: center; color: #999; font-size: 0.85rem; padding: 8px; width: 100%;">Không có quà để đổi</div>'
                            }
                        </div>
                    </td>
                    <td style="padding: 12px 8px; text-align: center; font-weight: bold; color: #FFA726; border: 1px solid #eee; width: 100px;"
                        id="total-points-${student.id}">
                        0
                    </td>
                    <td style="padding: 12px 8px; text-align: center; border: 1px solid #eee; width: 100px;">
                        <button onclick="executeExchangePoints(${student.id})" 
                                id="exchange-btn-${student.id}"
                                style="background: linear-gradient(45deg, #FFA726, #FFD54F); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem;"
                                disabled>
                            Đổi
                        </button>
                    </td>
                    <td style="padding: 12px 8px; text-align: center; font-weight: bold; color: #333; border: 1px solid #eee; width: 100px;"
                        id="remaining-points-${student.id}">
                        ${student.points}
                    </td>
                </tr>
            `;
    })
    .join("");
}

// Cập nhật thông tin đổi quà khi chọn quà
function updateExchangeInfo(studentId) {
  const button = document.getElementById(`exchange-btn-${studentId}`);
  const remainingPointsCell = document.getElementById(
    `remaining-points-${studentId}`
  );
  const totalPointsCell = document.getElementById(`total-points-${studentId}`);

  if (!button || !remainingPointsCell || !totalPointsCell) return;

  // Lấy tất cả checkbox được chọn
  const checkboxes = document.querySelectorAll(
    `input[type="checkbox"][id^="reward-checkbox-${studentId}-"]:checked`
  );

  const student = students.find((s) => s.id === studentId);
  if (!student) return;

  if (checkboxes.length > 0) {
    // Tính tổng điểm của các quà đã chọn
    let totalPoints = 0;
    checkboxes.forEach((checkbox) => {
      const points = parseInt(checkbox.dataset.points) || 0;
      totalPoints += points;
    });

    const remainingPoints = student.points - totalPoints;

    // Cập nhật hiển thị
    totalPointsCell.textContent = totalPoints;
    remainingPointsCell.textContent = remainingPoints;
    remainingPointsCell.style.color = remainingPoints >= 0 ? "#333" : "#f44336";
    button.disabled = remainingPoints < 0; // Disable nếu không đủ điểm
  } else {
    // Không có quà nào được chọn
    totalPointsCell.textContent = "0";
    remainingPointsCell.textContent = student.points;
    remainingPointsCell.style.color = "#333";
    button.disabled = true;
  }
}

// Thực hiện đổi điểm
function executeExchangePoints(studentId) {
  // Lấy tất cả checkbox được chọn
  const checkboxes = document.querySelectorAll(
    `input[type="checkbox"][id^="reward-checkbox-${studentId}-"]:checked`
  );

  if (checkboxes.length === 0) {
    alert("Vui lòng chọn ít nhất một quà để đổi!");
    return;
  }

  const student = students.find((s) => s.id === studentId);
  if (!student) {
    alert("Không tìm thấy học sinh!");
    return;
  }

  // Tính tổng điểm và lấy danh sách quà đã chọn
  let totalPointsRequired = 0;
  const selectedRewards = [];

  checkboxes.forEach((checkbox) => {
    const level = checkbox.value;
    const points = parseInt(checkbox.dataset.points) || 0;
    totalPointsRequired += points;

    const reward = rewardItems.find((r) => r.level === level);
    const rewardName = reward ? reward.itemName : level;
    selectedRewards.push({ name: rewardName, points, level });
  });

  if (student.points < totalPointsRequired) {
    alert(
      `Học sinh không đủ điểm! Cần ${totalPointsRequired} điểm nhưng chỉ có ${student.points} điểm.`
    );
    return;
  }

  const rewardNames = selectedRewards.map((r) => r.name).join(", ");

  // Trừ điểm
  student.points -= totalPointsRequired;

  // Lưu vào lịch sử cho mỗi quà (hoặc một bản ghi tổng hợp)
  if (!student.history) student.history = [];

  // Tạo một bản ghi lịch sử cho tất cả quà đổi cùng lúc
  student.history.push({
    date: new Date().toISOString(),
    points: -totalPointsRequired,
    total: student.points,
    reason: `Đổi quà: ${rewardNames}`,
  });

  // Lưu vào lịch sử chung
  addToHistory(
    studentId,
    student.name,
    -totalPointsRequired,
    student.points,
    "exchange"
  );

  // Lưu dữ liệu
  saveStudents();

  // Cập nhật giao diện
  renderExchangePointsTable();
  renderStudents();
  renderGroupGrid();
  renderTopStudents();
  updateHomeStats();

  // Phát âm thanh
  playGameSound("success");
}

function handleAddMultipleGroups(textareaId) {
  const ta = document.getElementById(textareaId);
  const names = (ta?.value || "")
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!ta) return;
  if (names.length === 0) return alert("Nhập ít nhất 1 tên nhóm.");
  names.forEach((n) => {
    groups.push({ id: Date.now() + Math.random(), name: n, studentIds: [] });
  });
  saveGroups();
  ta.value = "";
  renderGroupSelects();
  renderGroupGrid();
  renderGroupsGrid();
}

// Modal thêm nhóm
function showAddGroupModal() {
  document.getElementById("addGroupModal").style.display = "flex";
}

function closeAddGroupModal() {
  document.getElementById("addGroupModal").style.display = "none";
  document.getElementById("newGroupName").value = "";
}

function populateStudentSelection() {
  const container = document.getElementById("studentSelectionList");
  container.innerHTML = "";

  // Lấy danh sách học sinh đã có trong nhóm
  const studentsInGroups = new Set();
  groups.forEach((group) => {
    group.studentIds.forEach((id) => studentsInGroups.add(id));
  });

  students.forEach((student) => {
    const isInGroup = studentsInGroups.has(student.id);
    const div = document.createElement("div");
    div.style.cssText = `display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 8px; margin-bottom: 5px; background: ${
      isInGroup ? "#ffebee" : "#f8f9fa"
    }; opacity: ${isInGroup ? "0.6" : "1"};`;
    div.innerHTML = `
                <input type="checkbox" id="student-${student.id}" value="${
      student.id
    }" style="transform: scale(1.2);" ${isInGroup ? "disabled" : ""}>
                <label for="student-${
                  student.id
                }" style="flex: 1; cursor: pointer; font-weight: 500; color: ${
      isInGroup ? "#999" : "#333"
    };">${student.name}${isInGroup ? " (đã có nhóm)" : ""}</label>
            `;
    container.appendChild(div);
  });
}

function createNewGroup() {
  const textarea = document.getElementById("newGroupName");
  const names = (textarea?.value || "")
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!textarea || names.length === 0) {
    alert("Vui lòng nhập ít nhất một tên nhóm.");
    return;
  }

  // Kiểm tra tên nhóm trùng
  const duplicateNames = [];
  names.forEach((name) => {
    if (groups.some((g) => g.name.toLowerCase() === name.toLowerCase())) {
      duplicateNames.push(name);
    }
  });

  if (duplicateNames.length > 0) {
    alert(
      `Các tên nhóm sau đã tồn tại: ${duplicateNames.join(
        ", "
      )}. Vui lòng chọn tên khác.`
    );
    return;
  }

  // Tạo các nhóm mới
  names.forEach((name) => {
    const newGroup = {
      id: Date.now() + Math.random(),
      name: name,
      studentIds: [],
      points: 0,
    };
    groups.push(newGroup);
  });

  saveGroups();
  renderGroupsGrid();
  renderGroupSelects();
  closeAddGroupModal();
  alert(`Đã tạo ${names.length} nhóm thành công!`);
}

// Modal xóa nhóm
function showDeleteGroupModal() {
  document.getElementById("deleteGroupModal").style.display = "flex";
  populateDeleteGroupSelect();
}

function closeDeleteGroupModal() {
  document.getElementById("deleteGroupModal").style.display = "none";
  document.getElementById("deleteGroupSelect").value = "";
}

function populateDeleteGroupSelect() {
  const select = document.getElementById("deleteGroupSelect");
  select.innerHTML = '<option value="">Chọn nhóm...</option>';
  groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = group.name;
    select.appendChild(option);
  });
}

function deleteSelectedGroup() {
  const groupId = parseInt(document.getElementById("deleteGroupSelect").value);
  if (!groupId) {
    alert("Vui lòng chọn nhóm để xóa.");
    return;
  }

  if (confirm("Bạn có chắc chắn muốn xóa nhóm này?")) {
    groups = groups.filter((g) => g.id !== groupId);
    saveGroups();
    renderGroupsGrid();
    closeDeleteGroupModal();
    alert("Đã xóa nhóm thành công!");
  }
}

// Chọn nhiều nhóm
let isSelectGroupsMode = false;

function toggleSelectGroups() {
  isSelectGroupsMode = !isSelectGroupsMode;
  const btn = document.getElementById("selectGroupsBtn");
  const selectAllBtn = document.getElementById("selectAllGroupsBtn");
  const controls = document.getElementById("groupBulkControls");

  if (isSelectGroupsMode) {
    btn.textContent = "Hủy chọn";
    btn.style.background = "linear-gradient(45deg, #ff4757, #ff6b6b)";
    selectAllBtn.style.display = "block";
    controls.style.display = "flex";
  } else {
    btn.textContent = "Chọn nhiều";
    btn.style.background = "linear-gradient(45deg, #ff6b6b, #ff8e8e)";
    selectAllBtn.style.display = "none";
    controls.style.display = "none";
    // Bỏ chọn tất cả
    document
      .querySelectorAll(".group-select")
      .forEach((cb) => (cb.checked = false));
  }
  // Render lại danh sách để hiển thị/ẩn checkbox
  renderGroupsGrid();
}

function selectAllGroups() {
  document
    .querySelectorAll(".group-select")
    .forEach((cb) => (cb.checked = true));
}

function addPointsToSelectedGroups() {
  const points =
    parseInt(document.getElementById("groupBulkPoints").value) || 1;
  const selectedCheckboxes = document.querySelectorAll(".group-select:checked");
  const selectedGroups = Array.from(selectedCheckboxes).map((cb) =>
    parseInt(cb.id.replace("group-select-", ""))
  );

  if (selectedGroups.length === 0) {
    alert("Vui lòng chọn ít nhất một nhóm.");
    return;
  }

  pushUndo();
  selectedGroups.forEach((groupId) => {
    addPointsToGroup(points, groupId);
  });
  renderGroupsGrid();
  // Phát âm thanh khi cộng điểm cho nhiều nhóm
  playGameSound("success");
  // Bỏ tích tất cả các checkbox đã chọn
  selectedCheckboxes.forEach((cb) => (cb.checked = false));
}

function subtractPointsFromSelectedGroups() {
  const points =
    parseInt(document.getElementById("groupBulkPoints").value) || 1;
  const selectedCheckboxes = document.querySelectorAll(".group-select:checked");
  const selectedGroups = Array.from(selectedCheckboxes).map((cb) =>
    parseInt(cb.id.replace("group-select-", ""))
  );

  if (selectedGroups.length === 0) {
    alert("Vui lòng chọn ít nhất một nhóm.");
    return;
  }

  pushUndo();
  selectedGroups.forEach((groupId) => {
    addPointsToGroup(-points, groupId);
  });
  renderGroupsGrid();
  // Phát âm thanh khi trừ điểm cho nhiều nhóm
  playGameSound("click");
  // Bỏ tích tất cả các checkbox đã chọn
  selectedCheckboxes.forEach((cb) => (cb.checked = false));
}

function deleteSelectedGroups() {
  const selectedGroups = Array.from(
    document.querySelectorAll(".group-select:checked")
  ).map((cb) => parseInt(cb.id.replace("group-select-", "")));

  if (selectedGroups.length === 0) {
    alert("Vui lòng chọn ít nhất một nhóm để xóa.");
    return;
  }

  if (
    confirm(`Bạn có chắc chắn muốn xóa ${selectedGroups.length} nhóm đã chọn?`)
  ) {
    groups = groups.filter((g) => !selectedGroups.includes(g.id));
    saveGroups();
    renderGroupsGrid();
    alert("Đã xóa nhóm thành công!");
  }
}

// Khởi tạo trang
// Thống kê và hiển thị
function updateStats() {
  const totalStudents = students.length;
  const avgPoints =
    totalStudents > 0
      ? Math.round(
          students.reduce((sum, s) => sum + s.points, 0) / totalStudents
        )
      : 0;
  const excellentStudents = students.filter(
    (s) => getCurrentLevel(s.points).name === "Vua"
  ).length;
  const classProgress =
    totalStudents > 0
      ? Math.round(
          students.reduce(
            (sum, s) => sum + getProgressPercentage(s.points),
            0
          ) / totalStudents
        )
      : 0;

  document.getElementById("totalStudents").textContent = totalStudents;
  document.getElementById("avgPoints").textContent = avgPoints;
  document.getElementById("excellentStudents").textContent = excellentStudents;
  document.getElementById("classProgress").textContent = classProgress;
  document.getElementById("progressSlider").value = classProgress;
}

function renderMembersList() {
  const membersList = document.getElementById("membersList");
  if (!membersList) return;

  const topStudents = students.sort((a, b) => b.points - a.points).slice(0, 5);

  membersList.innerHTML = topStudents
    .map(
      (student, index) => `
            <div class="member">
                <div class="member-avatar">${student.name
                  .charAt(0)
                  .toUpperCase()}</div>
                <div class="member-name">${student.name}</div>
            </div>
        `
    )
    .join("");
}

function renderAllStudentsList() {
  const allStudentsList = document.getElementById("allStudentsList");
  if (!allStudentsList) return;

  // Sắp xếp theo từ cuối của tên
  const sortedStudents = [...students].sort(sortStudentsByLastName);

  allStudentsList.innerHTML = sortedStudents
    .map((student) => {
      const level = getCurrentLevel(student.points);
      return `
                <div class="member" style="margin-bottom: 8px;">
                    <div class="member-avatar" style="background: ${
                      level.color
                    };">
                        <img src="${getLevelImage(level.name)}" alt="${
        level.name
      }" style="width: 30px; height: 30px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <span style="display: none;">${level.icon}</span>
                    </div>
                    <div class="member-info">
                        <div class="member-name">${student.name}</div>
                        <div class="member-level">${
                          level.name
                        } - <span style="color: ${getPointColor(
        student.points
      )}; font-weight: bold;">${student.points} điểm</span></div>
                    </div>
                    <div class="member-rank-icon">${level.icon}</div>
                </div>
            `;
    })
    .join("");
}

function renderGroupsGrid() {
  const groupsGrid = document.getElementById("groupsGrid");
  if (!groupsGrid) return;

  groupsGrid.innerHTML = groups
    .map(
      (group) => `
            <div class="my-device-card pink" onclick="selectGroup(${group.id})">
                <div class="my-device-info">
                    <div class="my-device-icon">👥</div>
                    <div class="my-device-name">${group.name}</div>
                </div>
                <div class="toggle-switch"></div>
            </div>
        `
    )
    .join("");
}

function selectGroup(groupId) {
  const groupSelect = document.getElementById("groupActionSelect");
  if (groupSelect) {
    groupSelect.value = groupId;
    renderGroupGrid();
  }
}

// Chọn nhiều học sinh
let isSelectMultipleMode = false;

function toggleSelectMultiple() {
  isSelectMultipleMode = !isSelectMultipleMode;
  const btn = document.getElementById("selectMultipleBtn");
  const selectAllBtn = document.getElementById("selectAllBtn");
  const controls = document.getElementById("bulkControls");

  if (isSelectMultipleMode) {
    btn.textContent = "Hủy chọn";
    btn.style.background = "linear-gradient(45deg, #ff6b6b, #ff8e8e)";
    selectAllBtn.style.display = "block";
    controls.style.display = "flex";
  } else {
    btn.textContent = "Chọn nhiều";
    btn.style.background = "linear-gradient(45deg, #6bcf7f, #4ecdc4)";
    selectAllBtn.style.display = "none";
    controls.style.display = "none";
    // Bỏ chọn tất cả
    document
      .querySelectorAll(".student-select")
      .forEach((cb) => (cb.checked = false));
  }
  // Render lại danh sách để hiển thị/ẩn checkbox
  renderStudents();
}

function selectAllStudents() {
  document
    .querySelectorAll(".student-select")
    .forEach((cb) => (cb.checked = true));
}

function addPointsToSelected() {
  const points = parseInt(document.getElementById("bulkPoints").value) || 1;
  const selectedStudents = Array.from(
    document.querySelectorAll(".student-select:checked")
  ).map((cb) => parseInt(cb.id.replace("student-select-", "")));

  if (selectedStudents.length === 0) {
    alert("Vui lòng chọn ít nhất một học sinh.");
    return;
  }

  pushUndo();
  const levelUpStudents = []; // Lưu danh sách học sinh lên cấp
  selectedStudents.forEach((id) => {
    const student = students.find((s) => s.id === id);
    if (student) {
      // Lưu level trước khi cộng điểm
      const oldLevel = getCurrentLevel(student.points);
      const currentLevel = getCurrentLevel(student.points);
      const adjusted = Math.round(points * (currentLevel.multiplier || 1));

      // Cộng điểm
      student.points = student.points + adjusted;

      // Kiểm tra level sau khi cộng điểm
      const newLevel = getCurrentLevel(student.points);

      // Kiểm tra xem có lên cấp không
      if (oldLevel.name !== newLevel.name) {
        levelUpStudents.push({
          id: id,
          name: student.name,
          newLevel: newLevel.name,
        });
      }

      // Lưu vào lịch sử
      addToHistory(id, student.name, adjusted, student.points, "bulk");
    }
  });
  saveStudents();
  renderStudents();
  renderGroupGrid();
  updateHomeStats();

  // Phát âm thanh khi cộng điểm cho nhiều học sinh
  playGameSound("success");

  // Hiển thị thông báo chúc mừng cho học sinh lên cấp
  if (levelUpStudents.length > 0) {
    playGameSound("levelup");
    showMultipleLevelUpNotifications(levelUpStudents);
  }
  // Highlight điểm của các học sinh đã chọn - đợi DOM render xong
  requestAnimationFrame(() => {
    setTimeout(() => {
      selectedStudents.forEach((id) => {
        const element = document.getElementById(`points-${id}`);
        if (element) {
          highlightPoints(`points-${id}`);
        }
      });
    }, 50);
  });
}

function subtractPointsFromSelected() {
  const points = parseInt(document.getElementById("bulkPoints").value) || 1;
  const selectedStudents = Array.from(
    document.querySelectorAll(".student-select:checked")
  ).map((cb) => parseInt(cb.id.replace("student-select-", "")));

  if (selectedStudents.length === 0) {
    alert("Vui lòng chọn ít nhất một học sinh.");
    return;
  }

  pushUndo();
  selectedStudents.forEach((id) => {
    const student = students.find((s) => s.id === id);
    if (student) {
      const currentLevel = getCurrentLevel(student.points);
      const adjusted = Math.round(points * (currentLevel.multiplier || 1));
      student.points = student.points - adjusted;
      // Lưu vào lịch sử (điểm âm)
      addToHistory(id, student.name, -adjusted, student.points, "bulk");
    }
  });
  saveStudents();
  renderStudents();
  renderGroupGrid();
  updateHomeStats();
  // Phát âm thanh khi trừ điểm cho nhiều học sinh
  playGameSound("click");
  // Highlight điểm của các học sinh đã chọn - đợi DOM render xong
  requestAnimationFrame(() => {
    setTimeout(() => {
      selectedStudents.forEach((id) => {
        const element = document.getElementById(`points-${id}`);
        if (element) {
          highlightPoints(`points-${id}`);
        }
      });
    }, 50);
  });
}

// Các hàm mới cho trang chủ
function updateHomeStats() {
  console.log("updateHomeStats called");
  const totalStudents = students.length;
  const levelCounts = {
    "Dân thường": 0,
    Lính: 0,
    Quan: 0,
    "Tể tướng": 0,
    Vua: 0,
  };

  students.forEach((student) => {
    const level = getCurrentLevel(student.points);
    levelCounts[level.name]++;
  });

  console.log("Level counts:", levelCounts);

  const totalEl = document.getElementById("totalStudents");
  const commonEl = document.getElementById("commonStudents");
  const soldierEl = document.getElementById("soldierStudents");
  const officialEl = document.getElementById("officialStudents");
  const primeEl = document.getElementById("primeStudents");
  const kingEl = document.getElementById("kingStudents");

  if (totalEl) totalEl.textContent = totalStudents;
  if (commonEl) commonEl.textContent = levelCounts["Dân thường"];
  if (soldierEl) soldierEl.textContent = levelCounts["Lính"];
  if (officialEl) officialEl.textContent = levelCounts["Quan"];
  if (primeEl) primeEl.textContent = levelCounts["Tể tướng"];
  if (kingEl) kingEl.textContent = levelCounts["Vua"];
}

function renderTopStudents() {
  const topStudentsList = document.getElementById("topStudentsList");
  const topStudents = students.sort((a, b) => b.points - a.points).slice(0, 5);

  topStudentsList.innerHTML = topStudents
    .map((student, index) => {
      const level = getCurrentLevel(student.points);
      return `
                <div class="member">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #FFA726; min-width: 30px; text-align: center;">${
                      index + 1
                    }</div>
                    <div class="member-avatar" style="background: ${
                      level.color
                    }; overflow: hidden;">
                        <img src="${getLevelImage(level.name)}" alt="${
        level.name
      }" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <span style="display: none;">${level.icon}</span>
                    </div>
                    <div class="member-info">
                        <div class="member-name">${student.name}</div>
                        <div class="member-level">${level.name} - ${
        student.points
      } điểm</div>
                    </div>
                </div>
            `;
    })
    .join("");
}

function renderTopGroups() {
  const topGroupsList = document.getElementById("topGroupsList");
  const groupStats = groups
    .map((group) => {
      // Đảm bảo nhóm có trường points (tương thích với dữ liệu cũ)
      if (typeof group.points === "undefined") {
        group.points = 0;
      }
      const members = students.filter((s) => group.studentIds.includes(s.id));
      // Xác định level nhóm dựa trên cấp bậc của thành viên có cấp bậc cao nhất trong nhóm
      const topMember = members.sort((a, b) => {
        const levelA = getCurrentLevel(a.points);
        const levelB = getCurrentLevel(b.points);
        // So sánh theo điểm yêu cầu của cấp bậc (cấp bậc cao hơn = điểm yêu cầu cao hơn)
        return levelB.points - levelA.points;
      })[0];
      const groupLevel = topMember
        ? getCurrentLevel(topMember.points)
        : levels[0];
      return { ...group, memberCount: members.length, groupLevel };
    })
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 3);

  topGroupsList.innerHTML = groupStats
    .map(
      (group, index) => `
            <div class="member">
                <div style="font-size: 1.5rem; font-weight: bold; color: #FFA726; min-width: 30px; text-align: center;">${
                  index + 1
                }</div>
                <div class="member-avatar" style="background: ${
                  group.groupLevel.color
                }; overflow: hidden;">
                    <img src="data/nhom4.png" alt="Nhóm 4" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <span style="display: none;">👥</span>
                </div>
                <div class="member-info">
                    <div class="member-name">${group.name}</div>
                    <div class="member-level">${
                      group.groupLevel.name
                    } - ${Math.round(group.points || 0)} điểm</div>
                </div>
            </div>
        `
    )
    .join("");
}

// Học sinh compact
function renderStudentsCompact() {
  console.log("renderStudentsCompact called");
  const grid = document.getElementById("studentGrid");
  if (!grid) {
    console.error("studentGrid not found");
    return;
  }
  grid.innerHTML = "";

  // Sắp xếp theo từ cuối của tên
  const sortedStudents = [...students].sort(sortStudentsByLastName);
  console.log("Students to render:", sortedStudents.length);

  sortedStudents.forEach((student) => {
    const currentLevel = getCurrentLevel(student.points);
    const progress = getProgressPercentage(student.points);
    console.log(
      "Rendering student:",
      student.name,
      "points:",
      student.points,
      "level:",
      currentLevel.name
    );

    const studentCard = document.createElement("div");
    studentCard.className = "student-card-compact";
    if (isSelectMultipleMode) {
      studentCard.style.cursor = "pointer";
      // Thêm sự kiện click vào thẻ để toggle checkbox
      studentCard.onclick = function (e) {
        // Không toggle nếu click vào checkbox hoặc button
        if (
          e.target.type === "checkbox" ||
          e.target.tagName === "BUTTON" ||
          e.target.closest("button")
        ) {
          return;
        }
        const checkbox = document.getElementById(
          `student-select-${student.id}`
        );
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change"));
        }
      };
    }
    studentCard.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                    ${
                      isSelectMultipleMode
                        ? `<input type="checkbox" id="student-select-${student.id}" class="student-select" style="width: 24px; height: 24px; cursor: pointer; transform: scale(1.3);" />`
                        : ""
                    }
                    <div class="student-name-compact" style="flex: 1;">${
                      student.name
                    }</div>
                </div>
                <div style="text-align: center; margin-bottom: 10px;">
                    <img src="${getLevelImage(currentLevel.name)}" alt="${
      currentLevel.name
    }" style="width: 60px; height: 60px; border-radius: 50%; border: 3px solid ${
      currentLevel.color
    }; background: ${
      currentLevel.color
    }; padding: 5px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <span style="display: none; font-size: 2rem;">${
                      currentLevel.icon
                    }</span>
                </div>
                <div class="student-level-compact" style="text-align: center; font-weight: bold; margin-bottom: 8px;">${
                  currentLevel.name
                }</div>
                <div id="points-${
                  student.id
                }" style="font-size: 1.2rem; font-weight: bold; color: #FFA726; margin: 8px 0; text-align: center; ${
      isSelectMultipleMode ? "cursor: pointer;" : ""
    }" ${
      isSelectMultipleMode
        ? `onclick="if(event.target.closest('button') === null && event.target.closest('input') === null) { const cb = document.getElementById('student-select-${student.id}'); if(cb) { cb.checked = !cb.checked; cb.dispatchEvent(new Event('change')); } }"`
        : ""
    }>${student.points} điểm</div>
                <div style="width: 100%; height: 8px; background: #f0f0f0; border-radius: 4px; margin: 10px 0; ${
                  isSelectMultipleMode ? "cursor: pointer;" : ""
                }" ${
      isSelectMultipleMode
        ? `onclick="if(event.target.closest('button') === null && event.target.closest('input') === null) { const cb = document.getElementById('student-select-${student.id}'); if(cb) { cb.checked = !cb.checked; cb.dispatchEvent(new Event('change')); } }"`
        : ""
    }>
                    <div style="width: ${progress}%; height: 100%; background: ${getLevelGradient(
      currentLevel.name
    )}; border-radius: 4px;"></div>
                </div>
                <div class="student-controls-compact">
                    <input type="number" id="compact-amount-${
                      student.id
                    }" value="1" min="1" step="1" style="width: 70px; padding: 4px; border-radius: 6px; border: 1px solid #eee; text-align: center; font-size: 0.8rem; background: white; cursor: text;" onfocus="console.log('Input focused:', ${
      student.id
    })" onchange="console.log('Input changed:', ${
      student.id
    }, this.value)" onclick="console.log('Input clicked:', ${student.id})" />
                    <button class="btn-compact subtract" onclick="applyCompactAmount(${
                      student.id
                    }, false)">−</button>
                    <button class="btn-compact add" onclick="applyCompactAmount(${
                      student.id
                    }, true)">+</button>
                </div>
            `;
    grid.appendChild(studentCard);
  });
  console.log("renderStudentsCompact completed");
}

// Nhóm với cấp bậc
function renderGroupsGrid() {
  const groupsGrid = document.getElementById("groupsGrid");
  if (!groupsGrid) return;

  // Thay đổi CSS để hiển thị 5 nhóm mỗi dòng
  groupsGrid.style.display = "grid";
  groupsGrid.style.gridTemplateColumns = "repeat(5, 1fr)";
  groupsGrid.style.gap = "20px";
  groupsGrid.innerHTML = "";

  groups.forEach((group) => {
    // Đảm bảo nhóm có trường points (tương thích với dữ liệu cũ)
    if (typeof group.points === "undefined") {
      group.points = 0;
    }
    const members = students.filter((s) => group.studentIds.includes(s.id));
    // Xác định level nhóm dựa trên cấp bậc của thành viên có cấp bậc cao nhất trong nhóm
    const topMember = members.sort((a, b) => {
      const levelA = getCurrentLevel(a.points);
      const levelB = getCurrentLevel(b.points);
      // So sánh theo điểm yêu cầu của cấp bậc (cấp bậc cao hơn = điểm yêu cầu cao hơn)
      return levelB.points - levelA.points;
    })[0];
    const groupLevel = topMember
      ? getCurrentLevel(topMember.points)
      : levels[0];

    const groupCard = document.createElement("div");
    groupCard.className = "group-card-fixed";
    groupCard.style.cssText = `
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                min-height: 150px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                transition: transform 0.3s ease;
                cursor: pointer;
                position: relative;
            `;

    // Thêm sự kiện click vào thẻ
    if (isSelectingGroups) {
      groupCard.onclick = function (e) {
        // Không toggle nếu click vào checkbox
        if (
          e.target.type === "checkbox" ||
          e.target.closest('input[type="checkbox"]')
        ) {
          return;
        }
        toggleGroupSelection(group.id);
      };
    } else {
      groupCard.onclick = function (e) {
        // Không mở modal nếu click vào checkbox
        if (
          e.target.type === "checkbox" ||
          e.target.closest('input[type="checkbox"]')
        ) {
          return;
        }
        showGroupStudentsModal(group.id);
      };
    }

    groupCard.innerHTML = `
                    ${
                      isSelectingGroups
                        ? `
                    <div style="position: absolute; top: 10px; right: 10px;">
                        <input type="checkbox" ${
                          selectedGroups.has(group.id) ? "checked" : ""
                        } 
                                onchange="toggleGroupSelection(${group.id})" 
                                onclick="event.stopPropagation();"
                                style="width: 24px; height: 24px; cursor: pointer; transform: scale(1.3);" />
                    </div>
                    `
                        : ""
                    }
                <div style="text-align: center; width: 100%;">
                    <div style="font-size: 1.5rem; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 15px;">Nhóm ${
                      group.name
                    }</div>
                    <div id="group-points-${
                      group.id
                    }" style="font-size: 2rem; font-weight: 900; background: linear-gradient(135deg, #FFA726 0%, #FF6B9D 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 15px;">${Math.round(
      group.points || 0
    )} điểm</div>
                    <div style="display: flex; justify-content: center; align-items: center; margin-top: 10px; margin-bottom: 15px;">
                        <img src="${getLevelImage(groupLevel.name)}" alt="${
      groupLevel.name
    }" style="width: 78px; height: 78px; border-radius: 50%; border: 3px solid ${
      groupLevel.color
    }; background: ${
      groupLevel.color
    }; padding: 3px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <span style="display: none; font-size: 3rem;">${
                          groupLevel.icon
                        }</span>
                </div>
                ${
                  !isSelectingGroups
                    ? `
                        <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 10px;">
                            <button class="btn-compact subtract" onclick="addPointsToGroup(-parseInt(document.getElementById('group-amount-${group.id}').value) || 1, ${group.id}); event.stopPropagation();" style="order: 1;">−</button>
                            <input type="number" id="group-amount-${group.id}" value="1" min="1" style="width: 90px; padding: 9px 8px; border-radius: 6px; border: 1px solid #eee; text-align: center; font-size: 1.125rem; order: 2;" onclick="event.stopPropagation();" />
                            <button class="btn-compact add" onclick="addPointsToGroup(parseInt(document.getElementById('group-amount-${group.id}').value) || 1, ${group.id}); event.stopPropagation();" style="order: 3;">+</button>
                    </div>
                                    `
                    : ""
                }
                                </div>
            `;
    groupsGrid.appendChild(groupCard);
  });
}

// Hàm thêm học sinh vào nhóm
function addStudentToGroup(groupId) {
  const select = document.getElementById(`student-select-${groupId}`);
  const studentId = parseInt(select.value);

  if (!studentId) {
    return;
  }

  // Kiểm tra học sinh đã có trong nhóm khác chưa
  const allAssignedStudentIds = groups.flatMap((g) => g.studentIds);
  if (allAssignedStudentIds.includes(studentId)) {
    return;
  }

  const group = groups.find((g) => g.id === groupId);
  if (group && !group.studentIds.includes(studentId)) {
    group.studentIds.push(studentId);
    saveGroups();
    renderGroupsGrid();
    updateHomeStats();
  }
}

// Hàm xóa học sinh khỏi nhóm
function removeStudentFromGroup(groupId, studentId) {
  const group = groups.find((g) => g.id === groupId);
  if (group) {
    group.studentIds = group.studentIds.filter((id) => id !== studentId);
    saveGroups();
    renderGroupsGrid(); // Render lại tất cả nhóm để cập nhật dropdown
    updateHomeStats();
  }
}

// Biến lưu groupId hiện tại đang mở
let currentGroupId = null;

// Hiển thị học sinh trong nhóm
function showGroupStudentsModal(groupId) {
  const group = groups.find((g) => g.id === groupId);
  if (!group) return;

  currentGroupId = groupId;
  document.getElementById("groupStudentsModalTitle").textContent = group.name;
  renderGroupStudents(groupId);
  document.getElementById("groupStudentsModal").style.display = "flex";
  // Đóng dropdown nếu đang mở
  document.getElementById("groupSettingsDropdown").style.display = "none";
  playSelectionSound();
}

function closeGroupStudentsModal() {
  document.getElementById("groupStudentsModal").style.display = "none";
  document.getElementById("groupSettingsDropdown").style.display = "none";
  currentGroupId = null;
  playSelectionSound();
}

// Toggle dropdown settings
function toggleGroupSettingsDropdown() {
  const dropdown = document.getElementById("groupSettingsDropdown");
  dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
}

// Đóng dropdown khi click ra ngoài
document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("groupSettingsDropdown");
  const settingsBtn = document.getElementById("groupSettingsBtn");
  if (
    dropdown &&
    settingsBtn &&
    !dropdown.contains(event.target) &&
    !settingsBtn.contains(event.target)
  ) {
    dropdown.style.display = "none";
  }
});

// Xóa nhóm hiện tại
function deleteCurrentGroup() {
  if (!currentGroupId) return;
  const group = groups.find((g) => g.id === currentGroupId);
  if (!group) return;

  if (confirm(`Bạn có chắc muốn xóa nhóm "${group.name}"?`)) {
    groups = groups.filter((g) => g.id !== currentGroupId);
    saveGroups();
    renderGroupsGrid();
    updateHomeStats();
    closeGroupStudentsModal();
    alert("Đã xóa nhóm thành công!");
  }
}

// Trao thưởng cho nhóm
function awardGroup() {
  if (!currentGroupId) return;
  alert("Tính năng trao thưởng đang được phát triển!");
  playSelectionSound();
}

// Hiển thị modal chỉnh sửa nhóm
function showEditGroupModal() {
  if (!currentGroupId) return;
  const group = groups.find((g) => g.id === currentGroupId);
  if (!group) return;

  document.getElementById("editGroupName").value = group.name;
  renderEditGroupMembers();
  updateAddStudentDropdown();
  document.getElementById("editGroupModal").style.display = "flex";
  document.getElementById("groupSettingsDropdown").style.display = "none";
  playSelectionSound();
}

function closeEditGroupModal() {
  document.getElementById("editGroupModal").style.display = "none";
  playSelectionSound();
}

// Render danh sách thành viên trong modal chỉnh sửa
function renderEditGroupMembers() {
  if (!currentGroupId) return;
  const group = groups.find((g) => g.id === currentGroupId);
  if (!group) return;

  const membersContainer = document.getElementById("editGroupMembers");
  const members = students
    .filter((s) => group.studentIds.includes(s.id))
    .sort(sortStudentsByLastName);

  if (members.length === 0) {
    membersContainer.innerHTML =
      '<div style="text-align:center; padding:20px; color:#666;">Nhóm này chưa có học sinh nào</div>';
    return;
  }

  membersContainer.innerHTML = members
    .map((student) => {
      const currentLevel = getCurrentLevel(student.points);
      return `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:#f8f9fa; border-radius:8px; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:40px; height:40px; border-radius:50%; background:${
                          currentLevel.color
                        }; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                            <img src="${getLevelImage(
                              currentLevel.name
                            )}" alt="${
        currentLevel.name
      }" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <span style="display:none; font-size:1.5rem;">${
                              currentLevel.icon
                            }</span>
                        </div>
                        <div>
                            <div style="font-weight:600; color:#333;">${
                              student.name
                            }</div>
                            <div style="font-size:0.85rem; color:#666;">${
                              currentLevel.name
                            } - ${student.points} điểm</div>
                        </div>
                    </div>
                    <button onclick="removeStudentFromGroupInEdit(${
                      student.id
                    })" style="background:#f44336; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-size:0.9rem;">Xóa</button>
                </div>
            `;
    })
    .join("");
}

// Cập nhật danh sách checkbox thêm học sinh
function updateAddStudentDropdown() {
  if (!currentGroupId) return;
  const group = groups.find((g) => g.id === currentGroupId);
  if (!group) return;

  const container = document.getElementById("addStudentToGroupList");
  if (!container) return;

  // Lấy tất cả các studentId đã có trong các nhóm khác (không tính nhóm hiện tại)
  const allGroupedStudentIds = new Set();
  groups.forEach((g) => {
    if (g.id !== currentGroupId) {
      g.studentIds.forEach((id) => allGroupedStudentIds.add(id));
    }
  });

  // Lọc ra các học sinh chưa có trong nhóm hiện tại và chưa có trong nhóm nào khác
  const availableStudents = students
    .filter(
      (s) => !group.studentIds.includes(s.id) && !allGroupedStudentIds.has(s.id)
    )
    .sort(sortStudentsByLastName);

  if (availableStudents.length === 0) {
    container.innerHTML =
      '<div style="text-align:center; padding:20px; color:#666;">Không có học sinh nào để thêm</div>';
    return;
  }

  container.innerHTML = availableStudents
    .map((student) => {
      const currentLevel = getCurrentLevel(student.points);
      return `
                <div style="display:flex; align-items:center; gap:12px; padding:10px; background:white; border-radius:8px; margin-bottom:8px; border:1px solid #e0e0e0;">
                    <input type="checkbox" id="add-student-${
                      student.id
                    }" value="${
        student.id
      }" style="transform: scale(1.2); cursor:pointer;">
                    <label for="add-student-${
                      student.id
                    }" style="flex:1; cursor:pointer; display:flex; align-items:center; gap:10px;">
                        <div style="width:35px; height:35px; border-radius:50%; background:${
                          currentLevel.color
                        }; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0;">
                            <img src="${getLevelImage(
                              currentLevel.name
                            )}" alt="${
        currentLevel.name
      }" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <span style="display:none; font-size:1.2rem;">${
                              currentLevel.icon
                            }</span>
                        </div>
                        <div>
                            <div style="font-weight:600; color:#333; font-size:0.95rem;">${
                              student.name
                            }</div>
                            <div style="font-size:0.8rem; color:#666;">${
                              currentLevel.name
                            } - ${student.points} điểm</div>
                        </div>
                    </label>
                </div>
            `;
    })
    .join("");
}

// Thêm học sinh vào nhóm từ modal chỉnh sửa
function addStudentToGroupFromEdit() {
  if (!currentGroupId) return;

  // Lấy tất cả các checkbox đã được chọn
  const selectedCheckboxes = document.querySelectorAll(
    '#addStudentToGroupList input[type="checkbox"]:checked'
  );
  const selectedStudentIds = Array.from(selectedCheckboxes).map((cb) =>
    parseInt(cb.value)
  );

  if (selectedStudentIds.length === 0) {
    return;
  }

  const group = groups.find((g) => g.id === currentGroupId);
  if (!group) return;

  // Kiểm tra và thêm các học sinh đã chọn
  selectedStudentIds.forEach((studentId) => {
    // Kiểm tra học sinh đã có trong nhóm hiện tại chưa
    if (group.studentIds.includes(studentId)) {
      return;
    }

    // Kiểm tra học sinh đã có trong nhóm khác chưa
    const studentInOtherGroup = groups.find(
      (g) => g.id !== currentGroupId && g.studentIds.includes(studentId)
    );
    if (studentInOtherGroup) {
      return;
    }

    // Thêm học sinh vào nhóm
    group.studentIds.push(studentId);
  });

  saveGroups();
  renderEditGroupMembers();
  updateAddStudentDropdown();
  renderGroupsGrid();
  playSelectionSound();
}

// Xóa học sinh khỏi nhóm từ modal chỉnh sửa
function removeStudentFromGroupInEdit(studentId) {
  if (!currentGroupId) return;
  const group = groups.find((g) => g.id === currentGroupId);
  if (!group) return;

  group.studentIds = group.studentIds.filter((id) => id !== studentId);
  saveGroups();
  renderEditGroupMembers();
  updateAddStudentDropdown();
  playSelectionSound();
}

// Lưu chỉnh sửa nhóm
function saveEditGroup() {
  if (!currentGroupId) return;
  const group = groups.find((g) => g.id === currentGroupId);
  if (!group) return;

  const newName = document.getElementById("editGroupName").value.trim();
  if (!newName) {
    alert("Vui lòng nhập tên nhóm!");
    return;
  }

  group.name = newName;
  saveGroups();
  renderGroupsGrid();
  renderGroupStudents(currentGroupId);
  closeEditGroupModal();
  alert("Đã lưu chỉnh sửa nhóm thành công!");
  playSelectionSound();
}

function renderGroupStudents(groupId) {
  const group = groups.find((g) => g.id === groupId);
  if (!group) return;

  const groupStudentsContent = document.getElementById("groupStudentsContent");
  if (!groupStudentsContent) return;

  const members = students
    .filter((s) => group.studentIds.includes(s.id))
    .sort(sortStudentsByLastName);

  if (members.length === 0) {
    groupStudentsContent.innerHTML =
      '<div style="width:100%; text-align:center; padding:40px; color:#666;">Nhóm này chưa có học sinh nào</div>';
    return;
  }

  // Hiển thị thẻ học sinh dạng card nhỏ với avatar và tên
  groupStudentsContent.innerHTML = members
    .map((student, index) => {
      const currentLevel = getCurrentLevel(student.points);
      // Xác định màu nền vòng tròn điểm: xanh khi điểm >= 0, đỏ khi điểm < 0
      const badgeColor =
        student.points >= 0
          ? "linear-gradient(135deg, #4caf50, #66bb6a)"
          : "linear-gradient(135deg, #f44336, #e57373)";
      const badgeShadowColor =
        student.points >= 0
          ? "rgba(76, 175, 80, 0.4)"
          : "rgba(244, 67, 54, 0.4)";

      return `
                <div style="position:relative; background:#fff; border-radius:15px; padding:19px; box-shadow:0 2px 8px rgba(0,0,0,0.1); width:150px; min-width:150px; height:220px; min-height:220px; text-align:center; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.3s ease;">
                    <div style="position:relative; display:inline-block; margin-bottom:12px; flex-shrink:0;">
                        <div style="width:100px; height:100px; border-radius:50%; background:${
                          currentLevel.color
                        }; display:flex; align-items:center; justify-content:center; margin:0 auto; overflow:hidden; transition:transform 0.3s ease;">
                            <img src="${getLevelImage(
                              currentLevel.name
                            )}" alt="${
        currentLevel.name
      }" style="width:100%; height:100%; object-fit:cover; transition:transform 0.3s ease;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <span style="display:none; font-size:3.75rem; align-items:center; justify-content:center;">${
                              currentLevel.icon
                            }</span>
                        </div>
                        <div style="position:absolute; top:-8px; right:-8px; background:${badgeColor}; color:#fff; border-radius:50%; width:42px; height:42px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; font-weight:bold; border:3px solid #fff; box-shadow:0 2px 8px ${badgeShadowColor}; transition:all 0.3s ease; animation:pulse 2s ease-in-out infinite;">${
        student.points
      }</div>
                    </div>
                    <div style="font-size:1.125rem; font-weight:600; color:#333; word-wrap:break-word; overflow-wrap:break-word; line-height:1.4; padding-top:8px; flex:1; display:flex; align-items:center; justify-content:center;">${
                      student.name
                    }</div>
                </div>
            `;
    })
    .join("");
}

// Tính năng bấm giờ
let timerInterval = null;
let timerSeconds = 0;
let isCountdown = false;
let targetTime = 0;

function showTimerModal() {
  document.getElementById("timerModal").style.display = "flex";
  playSelectionSound();
}

function closeTimerModal() {
  document.getElementById("timerModal").style.display = "none";
  stopTimer();
  playSelectionSound();
}

function startCountdown() {
  const minutes =
    parseInt(document.getElementById("countdownMinutes").value) || 0;
  const seconds =
    parseInt(document.getElementById("countdownSeconds").value) || 0;
  targetTime = minutes * 60 + seconds;
  if (targetTime <= 0) {
    alert("Vui lòng nhập thời gian lớn hơn 0.");
    return;
  }
  timerSeconds = targetTime;
  isCountdown = true;
  startTimer();
  playSelectionSound();
}

function startStopwatch() {
  timerSeconds = 0;
  isCountdown = false;
  startTimer();
  playSelectionSound();
}

function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    if (isCountdown) {
      timerSeconds--;
      if (timerSeconds <= 0) {
        timerSeconds = 0;
        clearInterval(timerInterval);
        timerInterval = null;
        // Phát âm thanh chuông
        playBellSound();
        alert("Hết giờ!");
      }
    } else {
      timerSeconds++;
    }

    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;

    const timeString = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    document.getElementById("timerDisplay").textContent = timeString;
    document.getElementById("timerDisplayModal").textContent = timeString;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    playSelectionSound();
  }
}

function playBellSound() {
  // Tạo âm thanh "reng reng" - lặp lại 5 lần
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime;

  // Mỗi lần "reng reng" = 2 tiếng chuông nhanh (ring ring)
  const totalRings = 5; // Lặp lại 5 lần
  const ringDuration = 0.15; // Thời gian mỗi tiếng "reng"
  const pauseBetweenRings = 0.05; // Nghỉ giữa 2 tiếng "reng" trong cùng một lần
  const pauseBetweenCycles = 0.2; // Nghỉ giữa các lần "reng reng"

  let currentTime = now;

  for (let cycle = 0; cycle < totalRings; cycle++) {
    // Mỗi lần phát 2 tiếng "reng reng"
    for (let ring = 0; ring < 2; ring++) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Tần số chuông báo động: 800 Hz (âm thanh sắc, khẩn cấp)
      oscillator.type = "square"; // Sóng vuông để tạo âm thanh sắc
      oscillator.frequency.setValueAtTime(800, currentTime);

      // Volume: tăng nhanh, giữ, giảm nhanh
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.7, currentTime + 0.01); // Tăng nhanh
      gainNode.gain.setValueAtTime(0.7, currentTime + ringDuration * 0.8); // Giữ
      gainNode.gain.linearRampToValueAtTime(0, currentTime + ringDuration); // Giảm nhanh

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + ringDuration);

      // Thời gian cho tiếng chuông tiếp theo
      currentTime += ringDuration + pauseBetweenRings;
    }

    // Nghỉ giữa các lần "reng reng"
    currentTime += pauseBetweenCycles - pauseBetweenRings;
  }
}

// Gọi tên ngẫu nhiên
let randomCallInterval = null;
let isRandomCalling = false;
let calledStudentIds = new Set(); // Lưu các ID học sinh đã được gọi trong phiên hiện tại

function showRandomCallModal() {
  document.getElementById("randomCallModal").style.display = "flex";
  // Reset hiển thị về trạng thái ban đầu
  document.getElementById("randomNameDisplay").textContent = "Bấm để bắt đầu";
  // Đảm bảo button ở trạng thái "Bắt đầu"
  const button = document.getElementById("randomCallButton");
  button.textContent = "Bắt đầu";
  button.style.background = "linear-gradient(45deg, #6bcf7f, #4ecdc4)";
  isRandomCalling = false;
  playSelectionSound();
  updateCalledStudentsInfo();
}

function resetCalledStudents() {
  calledStudentIds.clear();
  updateCalledStudentsInfo();
  playSelectionSound();
}

function updateCalledStudentsInfo() {
  const infoEl = document.getElementById("calledStudentsInfo");
  if (infoEl) {
    const calledCount = calledStudentIds.size;
    const totalCount = students.length;
    infoEl.textContent = `Đã gọi: ${calledCount}/${totalCount} học sinh`;
  }
}

function closeRandomCallModal() {
  // Chỉ dừng interval nếu đang chạy, không chọn tên
  if (randomCallInterval) {
    clearInterval(randomCallInterval);
    randomCallInterval = null;
  }
  isRandomCalling = false;
  // Reset button về trạng thái ban đầu
  const button = document.getElementById("randomCallButton");
  if (button) {
    button.textContent = "Bắt đầu";
    button.style.background = "linear-gradient(45deg, #6bcf7f, #4ecdc4)";
  }
  document.getElementById("randomCallModal").style.display = "none";
  playSelectionSound();
}

function toggleRandomCall() {
  if (students.length === 0) {
    document.getElementById("randomNameDisplay").textContent =
      "Chưa có học sinh";
    return;
  }

  if (isRandomCalling) {
    stopRandomCall();
  } else {
    startRandomCall();
  }
  playSelectionSound();
}

function startRandomCall() {
  isRandomCalling = true;
  const button = document.getElementById("randomCallButton");
  button.textContent = "Dừng";
  button.style.background = "linear-gradient(45deg, #ff6b6b, #ff8e8e)";

  randomCallInterval = setInterval(() => {
    // Lọc ra các học sinh chưa được gọi mỗi lần quay
    let availableStudents = students.filter((s) => !calledStudentIds.has(s.id));

    // Nếu tất cả học sinh đã được gọi, reset danh sách
    if (availableStudents.length === 0) {
      calledStudentIds.clear();
      availableStudents = [...students];
    }

    const randomIndex = Math.floor(Math.random() * availableStudents.length);
    const selectedStudent = availableStudents[randomIndex];
    document.getElementById("randomNameDisplay").textContent =
      selectedStudent.name;
  }, 100);
}

function stopRandomCall() {
  if (randomCallInterval) {
    clearInterval(randomCallInterval);
    randomCallInterval = null;
  }

  // Chỉ chọn và hiển thị tên nếu đang trong quá trình quay
  if (isRandomCalling && students.length > 0) {
    const count = parseInt(document.getElementById("randomCount").value) || 1;

    // Lọc ra các học sinh chưa được gọi
    let availableStudents = students.filter((s) => !calledStudentIds.has(s.id));

    // Nếu không đủ học sinh chưa được gọi, reset danh sách
    if (availableStudents.length < count) {
      calledStudentIds.clear();
      availableStudents = [...students];
    }

    const selectedStudents = [];
    const usedIndices = new Set();

    // Chọn ngẫu nhiên không trùng lặp từ danh sách học sinh chưa được gọi
    while (
      selectedStudents.length < count &&
      selectedStudents.length < availableStudents.length
    ) {
      const randomIndex = Math.floor(Math.random() * availableStudents.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        selectedStudents.push(availableStudents[randomIndex]);
      }
    }

    // Thêm các học sinh đã chọn vào danh sách loại trừ
    selectedStudents.forEach((student) => {
      calledStudentIds.add(student.id);
    });

    if (selectedStudents.length === 1) {
      const student = selectedStudents[0];
      const level = getCurrentLevel(student.points);
      document.getElementById(
        "randomNameDisplay"
      ).textContent = `${student.name} (${level.name})`;
    } else {
      const names = selectedStudents.map((s) => s.name).join("<br>");
      document.getElementById("randomNameDisplay").innerHTML = names;
    }

    // Phát âm thanh vui hơn
    playHappySelectionSound();

    // Cập nhật thông tin số lượng học sinh đã gọi
    updateCalledStudentsInfo();
  }

  isRandomCalling = false;
  const button = document.getElementById("randomCallButton");
  button.textContent = "Bắt đầu";
  button.style.background = "linear-gradient(45deg, #6bcf7f, #4ecdc4)";
}

function playSelectionSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.3
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
}

function playHappySelectionSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Tạo âm thanh vui vẻ hơn với nhiều nốt
  const frequencies = [523, 659, 784, 1047]; // C, E, G, C (quãng tám)

  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(
      freq,
      audioContext.currentTime + index * 0.1
    );
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + index * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + index * 0.1 + 0.3
    );

    oscillator.start(audioContext.currentTime + index * 0.1);
    oscillator.stop(audioContext.currentTime + index * 0.1 + 0.3);
  });
}

// Đo âm thanh
let soundMeterInterval = null;
let soundMode = null; // 'noise' hoặc 'reading'
let audioContext = null;
let microphone = null;
let analyser = null;
let dataArray = null;
let soundSensitivity = 1.0; // Độ nhạy mặc định
let alertCooldown = false; // Để tránh báo động liên tục

function showSoundModal() {
  document.getElementById("soundModal").style.display = "flex";
  playSelectionSound();
  // Khởi tạo thanh điều chỉnh độ nhạy
  const sensitivitySlider = document.getElementById("sensitivitySlider");
  const sensitivityValue = document.getElementById("sensitivityValue");
  if (sensitivitySlider && sensitivityValue) {
    sensitivitySlider.value = soundSensitivity;
    updateSensitivityDisplay();
    sensitivitySlider.oninput = function () {
      soundSensitivity = parseFloat(this.value);
      updateSensitivityDisplay();
    };
  }
}

function updateSensitivityDisplay() {
  const sensitivityValue = document.getElementById("sensitivityValue");
  if (sensitivityValue) {
    const thresholdDb = Math.round(100 / soundSensitivity);
    sensitivityValue.textContent =
      soundSensitivity.toFixed(1) + "x (≈" + thresholdDb + "dB)";
  }
}

function closeSoundModal() {
  document.getElementById("soundModal").style.display = "none";
  stopSoundMeter();
  playSelectionSound();
}

function startNoiseMeter() {
  soundMode = "noise";
  startSoundMeter();
  playSelectionSound();
}

function startReadingMeter() {
  soundMode = "reading";
  startSoundMeter();
  playSelectionSound();
}

function startSoundMeter() {
  if (soundMeterInterval) {
    clearInterval(soundMeterInterval);
  }

  // Sử dụng Web Audio API để đo âm thanh thực
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      microphone = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      microphone.connect(analyser);

      soundMeterInterval = setInterval(() => {
        analyser.getByteTimeDomainData(dataArray);

        // Tính toán RMS (Root Mean Square) để có giá trị âm thanh chính xác
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const value = dataArray[i];
          const normalized = (value - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / bufferLength);

        // Tính dB chính xác hơn: dB = 20 * log10(rms / reference)
        // Reference = 0.01 (âm thanh rất nhỏ) để có phạm vi dB hợp lý
        // Scale để có phạm vi 0-120dB
        const reference = 0.01;
        let db = 0;
        if (rms > 0) {
          db = 20 * Math.log10(rms / reference);
          // Scale để phù hợp với phạm vi thực tế (0-120dB)
          db = Math.max(0, Math.min(120, db * 1.5));
        }
        db = Math.round(db);

        // Tính mức dB yêu cầu dựa trên độ nhạy (100dB là chuẩn)
        // Độ nhạy càng cao (số lớn) thì mức yêu cầu càng thấp
        // Ví dụ: 1.0x = 100dB, 2.0x = 50dB, 0.5x = 200dB
        const thresholdDb = 100 / soundSensitivity;

        document.getElementById(
          "soundLevelDisplay"
        ).textContent = `${db} dB (Yêu cầu: ${Math.round(thresholdDb)} dB)`;

        // Cập nhật thanh âm thanh (lấy 120dB làm max)
        const percentage = Math.min(100, (db / 120) * 100);
        document.getElementById("soundBar").style.width = `${percentage}%`;

        // Cập nhật trạng thái và báo động
        let status = "";
        let barColor = "";
        let shouldAlert = false;

        if (soundMode === "noise") {
          // Chế độ đo tiếng ồn: báo động khi vượt quá mức yêu cầu
          if (db < thresholdDb * 0.7) {
            status = "Yên tĩnh";
            barColor = "linear-gradient(90deg, #6bcf7f, #4ecdc4)";
          } else if (db < thresholdDb) {
            status = "Bình thường";
            barColor = "linear-gradient(90deg, #ffd93d, #FFCA28)";
          } else {
            status = `Ồn ào! (Vượt ${Math.round(db - thresholdDb)}dB)`;
            barColor = "linear-gradient(90deg, #ff6b6b, #ff8e8e)";
            shouldAlert = true;
          }
        } else if (soundMode === "reading") {
          // Chế độ luyện đọc: báo động khi quá nhỏ hoặc quá to
          if (db < thresholdDb * 0.7) {
            status = "Quá nhỏ - Đọc to hơn!";
            barColor = "linear-gradient(90deg, #ff6b6b, #ff8e8e)";
          } else if (db <= thresholdDb * 1.3) {
            status = "Tốt - Tiếp tục!";
            barColor = "linear-gradient(90deg, #6bcf7f, #4ecdc4)";
          } else {
            status = "Quá to - Đọc nhỏ hơn!";
            barColor = "linear-gradient(90deg, #ffd93d, #FFCA28)";
            shouldAlert = true;
          }
        }

        document.getElementById("soundBar").style.background = barColor;
        document.getElementById("soundStatus").textContent = status;

        // Báo động khi vượt quá mức (tránh báo động liên tục)
        if (shouldAlert && !alertCooldown) {
          alertCooldown = true;
          playBellSound();
          setTimeout(() => {
            alertCooldown = false;
          }, 2000); // Cooldown 2 giây
        }
      }, 100);
    })
    .catch((err) => {
      console.error("Lỗi truy cập microphone:", err);
      alert(
        "Không thể truy cập microphone. Vui lòng cấp quyền truy cập microphone và thử lại."
      );
    });
}

function stopSoundMeter() {
  if (soundMeterInterval) {
    clearInterval(soundMeterInterval);
    soundMeterInterval = null;
  }

  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
  }

  if (microphone && microphone.mediaStream) {
    microphone.mediaStream.getTracks().forEach((track) => track.stop());
  }

  // Phát âm thanh khi dừng
  playSelectionSound();

  audioContext = null;
  microphone = null;
  analyser = null;
  dataArray = null;
  alertCooldown = false; // Reset cooldown

  document.getElementById("soundLevelDisplay").textContent = "0 dB";
  document.getElementById("soundBar").style.width = "0%";
  document.getElementById("soundStatus").textContent = "Chọn chế độ đo";
  soundMode = null;
}

// Báo cáo
function generateReport() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const reportContent = document.getElementById("reportContent");

  // Giữ nguyên thứ tự học sinh (không sắp xếp)
  const reportStudents = [...students];

  const totalStudents = students.length;
  const totalPoints =
    totalStudents > 0 ? students.reduce((sum, s) => sum + s.points, 0) : 0;
  const sortedForTop = [...students].sort((a, b) => b.points - a.points);
  const topStudent = sortedForTop[0];

  let dateRangeText = "";
  if (startDate && endDate) {
    dateRangeText = `từ ${startDate} đến ${endDate}`;
  } else {
    dateRangeText = "tất cả thời gian";
  }

  reportContent.innerHTML = `
            <div style="background: white; border-radius: 15px; padding: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <h3 style="color: #4a5568; margin-bottom: 20px;">Báo cáo ${dateRangeText}</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                        <div style="font-size: 2rem; font-weight: bold; color: #FFA726;">${totalStudents}</div>
                        <div style="color: #666;">Tổng học sinh</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                        <div style="font-size: 2rem; font-weight: bold; color: #FFA726;">${totalPoints}</div>
                        <div style="color: #666;">Tổng điểm cả lớp</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                        <div style="font-size: 2rem; font-weight: bold; color: #FFA726;">${
                          topStudent ? topStudent.name : "N/A"
                        }</div>
                        <div style="color: #666;">Học sinh xuất sắc</div>
                    </div>
                </div>
                <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; overflow-x: auto;">
                    <h4 style="color: #4a5568; margin-bottom: 15px;">Bảng điểm chi tiết</h4>
                    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #42A5F5 0%, #FF7043 50%, #FFA726 100%); color: white;">
                                <th style="padding: 12px 8px; text-align: center; font-weight: bold; border: 1px solid #ddd;">STT</th>
                                <th style="padding: 12px 8px; text-align: left; font-weight: bold; border: 1px solid #ddd;">Tên học sinh</th>
                                <th style="padding: 12px 8px; text-align: center; font-weight: bold; border: 1px solid #ddd;">Điểm hiện tại</th>
                                <th style="padding: 12px 8px; text-align: center; font-weight: bold; border: 1px solid #ddd;">Cấp bậc</th>
                                <th style="padding: 12px 8px; text-align: center; font-weight: bold; border: 1px solid #ddd;">Tiến độ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reportStudents
                              .map((student, index) => {
                                const level = getCurrentLevel(student.points);
                                const progress = Math.round(
                                  getProgressPercentage(student.points)
                                );
                                return `
                                    <tr style="border-bottom: 1px solid #eee; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
                                        <td style="padding: 10px 8px; text-align: center; font-weight: bold; color: #FFA726; border: 1px solid #eee;">${
                                          index + 1
                                        }</td>
                                        <td style="padding: 10px 8px; font-weight: 600; border: 1px solid #eee;">${
                                          student.name
                                        }</td>
                                        <td style="padding: 10px 8px; text-align: center; font-weight: bold; color: ${getPointColor(
                                          student.points
                                        )}; border: 1px solid #eee;">${
                                  student.points
                                }</td>
                                        <td style="padding: 10px 8px; text-align: center; border: 1px solid #eee;">
                                            <span style="background: ${
                                              level.color
                                            }; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">${
                                  level.name
                                }</span>
                                        </td>
                                        <td style="padding: 10px 8px; text-align: center; border: 1px solid #eee;">
                                            <div style="position: relative; width: 100%; height: 24px; background: #e9ecef; border-radius: 12px; overflow: hidden;">
                                                <div style="position: absolute; left: 0; top: 0; height: 100%; width: ${progress}%; background: linear-gradient(90deg, ${
                                  level.color
                                }, #FFA726); transition: width 0.3s;"></div>
                                                <div style="position: absolute; width: 100%; text-align: center; line-height: 24px; font-size: 0.75rem; font-weight: bold; color: #333;">${progress}%</div>
                                        </div>
                                        </td>
                                    </tr>
                            `;
                              })
                              .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
}

// Xuất Excel
function exportToExcel() {
  // Giữ nguyên thứ tự học sinh (không sắp xếp)
  const reportStudents = [...students];

  // Lấy khoảng thời gian từ input hoặc mặc định 7 ngày gần nhất
  const startDateInput = document.getElementById("startDate").value;
  const endDateInput = document.getElementById("endDate").value;

  let startDate, endDate;
  if (startDateInput && endDateInput) {
    startDate = new Date(startDateInput);
    endDate = new Date(endDateInput);
  } else {
    // Mặc định: 7 ngày gần nhất
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
  }

  // Đặt giờ về 00:00:00 để so sánh ngày
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  // Tạo danh sách các ngày
  const dateList = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dateList.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Tính điểm cho mỗi học sinh theo từng ngày (tách cộng và trừ)
  const reportData = reportStudents.map((student, index) => {
    const row = {
      stt: index + 1,
      name: student.name,
      dailyAdded: {}, // Điểm cộng
      dailySubtracted: {}, // Điểm trừ
    };

    // Khởi tạo điểm 0 cho mỗi ngày
    dateList.forEach((date) => {
      const dateKey = date.toLocaleDateString("vi-VN");
      row.dailyAdded[dateKey] = 0;
      row.dailySubtracted[dateKey] = 0;
    });

    // Tính tổng điểm từ history cho mỗi ngày (tách cộng/trừ)
    if (student.history && Array.isArray(student.history)) {
      student.history.forEach((record) => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);

        if (recordDate >= startDate && recordDate <= endDate) {
          const dateKey = recordDate.toLocaleDateString("vi-VN");
          if (record.points > 0) {
            // Điểm cộng
            if (row.dailyAdded[dateKey] !== undefined) {
              row.dailyAdded[dateKey] += record.points;
            }
          } else if (record.points < 0) {
            // Điểm trừ (lưu giá trị dương)
            if (row.dailySubtracted[dateKey] !== undefined) {
              row.dailySubtracted[dateKey] += Math.abs(record.points);
            }
          }
        }
      });
    }

    row.total = student.points;
    row.level = getCurrentLevel(student.points).name;

    return row;
  });

  // Tính tổng điểm mỗi ngày của cả lớp (tách cộng và trừ)
  const dailyTotalsAdded = {};
  const dailyTotalsSubtracted = {};
  dateList.forEach((date) => {
    const dateKey = date.toLocaleDateString("vi-VN");
    dailyTotalsAdded[dateKey] = reportData.reduce(
      (sum, row) => sum + row.dailyAdded[dateKey],
      0
    );
    dailyTotalsSubtracted[dateKey] = reportData.reduce(
      (sum, row) => sum + row.dailySubtracted[dateKey],
      0
    );
  });

  const totalPoints = students.reduce((sum, s) => sum + s.points, 0);

  // Tạo HTML table để xuất Excel
  let htmlContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <!--[if gte mso 9]><xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Báo cáo chi tiết</x:Name>
                            <x:WorksheetOptions>
                                <x:DefaultRowHeight>285</x:DefaultRowHeight>
                            </x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
                </xml><![endif]-->
            </head>
            <body>
                <h2 style="text-align: center; color: #FFA726; margin-bottom: 10px;">BÁO CÁO ĐIỂM CHI TIẾT LỚP HỌC</h2>
                <p style="text-align: center; margin-bottom: 5px;">Ngày xuất: ${new Date().toLocaleDateString(
                  "vi-VN"
                )}</p>
                <p style="text-align: center; margin-bottom: 20px; font-style: italic;">
                    Từ ${startDate.toLocaleDateString(
                      "vi-VN"
                    )} đến ${endDate.toLocaleDateString("vi-VN")}
                </p>
                <p style="font-weight: bold;">Tổng số học sinh: ${
                  students.length
                }</p>
                <p style="font-weight: bold; margin-bottom: 20px;">Tổng điểm cả lớp: ${totalPoints}</p>
                
                <table border="1" cellspacing="0" cellpadding="6" style="width: 100%; border-collapse: collapse; font-size: 10pt;">
                    <thead>
                        <tr style="background-color: #42A5F5; color: white; font-weight: bold;">
                            <th rowspan="2" style="text-align: center; padding: 10px; min-width: 40px; vertical-align: middle;">STT</th>
                            <th rowspan="2" style="text-align: left; padding: 10px; min-width: 150px; vertical-align: middle;">Tên học sinh</th>
                            ${dateList
                              .map(
                                (date) => `
                                <th colspan="2" style="text-align: center; padding: 8px; min-width: 80px; background-color: #64B5F6;">
                                    ${date.toLocaleDateString("vi-VN", {
                                      day: "2-digit",
                                      month: "2-digit",
                                    })}
                                </th>
                            `
                              )
                              .join("")}
                            <th rowspan="2" style="text-align: center; padding: 10px; min-width: 80px; background-color: #FFA726; vertical-align: middle;">Tổng điểm</th>
                            <th rowspan="2" style="text-align: center; padding: 10px; min-width: 100px; vertical-align: middle;">Cấp bậc</th>
                    </tr>
                        <tr style="background-color: #42A5F5; color: white; font-weight: bold;">
                            ${dateList
                              .map(
                                () => `
                                <th style="text-align: center; padding: 6px; width: 50px; background-color: #4caf50;">+</th>
                                <th style="text-align: center; padding: 6px; width: 50px; background-color: #f44336;">-</th>
                            `
                              )
                              .join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData
                          .map(
                            (row) => `
                            <tr>
                                <td style="text-align: center; padding: 6px;">${
                                  row.stt
                                }</td>
                                <td style="padding: 6px; font-weight: 600;">${
                                  row.name
                                }</td>
                                ${dateList
                                  .map((date) => {
                                    const dateKey =
                                      date.toLocaleDateString("vi-VN");
                                    const added = row.dailyAdded[dateKey];
                                    const subtracted =
                                      row.dailySubtracted[dateKey];
                                    return `
                                        <td style="text-align: center; padding: 4px; color: #4caf50; font-weight: ${
                                          added > 0 ? "bold" : "normal"
                                        }; background-color: ${
                                      added > 0 ? "#e8f5e9" : "white"
                                    };">
                                            ${added > 0 ? added : ""}
                                        </td>
                                        <td style="text-align: center; padding: 4px; color: #f44336; font-weight: ${
                                          subtracted > 0 ? "bold" : "normal"
                                        }; background-color: ${
                                      subtracted > 0 ? "#ffebee" : "white"
                                    };">
                                            ${subtracted > 0 ? subtracted : ""}
                                        </td>
                                    `;
                                  })
                                  .join("")}
                                <td style="text-align: center; padding: 6px; font-weight: bold; background-color: #fff3cd;">
                                    ${row.total}
                                </td>
                                <td style="text-align: center; padding: 6px;">
                                    ${row.level}
                                </td>
                        </tr>
                    `
                          )
                          .join("")}
                    </tbody>
                    <tfoot>
                        <tr style="background-color: #f8f9fa; font-weight: bold;">
                            <td colspan="2" style="text-align: right; padding: 10px;">Tổng mỗi ngày:</td>
                            ${dateList
                              .map((date) => {
                                const dateKey =
                                  date.toLocaleDateString("vi-VN");
                                const totalAdded = dailyTotalsAdded[dateKey];
                                const totalSubtracted =
                                  dailyTotalsSubtracted[dateKey];
                                return `
                                    <td style="text-align: center; padding: 8px; color: #4caf50; font-weight: bold; background-color: #e8f5e9;">
                                        ${
                                          totalAdded > 0
                                            ? "+" + totalAdded
                                            : "0"
                                        }
                                    </td>
                                    <td style="text-align: center; padding: 8px; color: #f44336; font-weight: bold; background-color: #ffebee;">
                                        ${
                                          totalSubtracted > 0
                                            ? "-" + totalSubtracted
                                            : "0"
                                        }
                                    </td>
                                `;
                              })
                              .join("")}
                            <td style="text-align: center; padding: 10px; background-color: #FFA726; color: white; font-size: 12pt;">
                                ${totalPoints}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
                
                <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                    <h3 style="color: #4a5568; margin-bottom: 10px;">Ghi chú:</h3>
                    <ul style="color: #666; line-height: 1.8;">
                        <li><span style="color: #4caf50; font-weight: bold;">Cột (+)</span>: Tổng điểm được cộng trong ngày</li>
                        <li><span style="color: #f44336; font-weight: bold;">Cột (-)</span>: Tổng điểm bị trừ trong ngày (hiển thị giá trị dương)</li>
                        <li><span style="font-weight: bold;">Ô trống</span>: Không có thay đổi điểm trong ngày</li>
                        <li>Mỗi ngày có 2 cột riêng biệt để dễ theo dõi chi tiết điểm cộng và điểm trừ</li>
                    </ul>
                </div>
            </body>
            </html>
        `;

  const blob = new Blob([htmlContent], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `bao_cao_chi_tiet_${startDate
      .toLocaleDateString("vi-VN")
      .replace(/\//g, "-")}_${endDate
      .toLocaleDateString("vi-VN")
      .replace(/\//g, "-")}.xls`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Hiển thị modal nhập dữ liệu Excel
function showImportExcelModal() {
  document.getElementById("importExcelModal").style.display = "flex";
  playSelectionSound();
}

// Đóng modal nhập dữ liệu Excel
function closeImportExcelModal() {
  document.getElementById("importExcelModal").style.display = "none";
  // Reset file input
  document.getElementById("excelFileInput").value = "";
  playSelectionSound();
}

// Tải mẫu file Excel
function downloadExcelTemplate() {
  // Tạo dữ liệu mẫu
  const sampleData = [
    ["Tên học sinh", "Điểm"],
    ["Nguyễn Văn A", 10],
    ["Trần Thị B", 15],
    ["Lê Văn C", 20],
    ["Phạm Thị D", 25],
  ];

  // Tạo workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sampleData);

  // Đặt độ rộng cột
  ws["!cols"] = [
    { wch: 20 }, // Cột Tên học sinh
    { wch: 10 }, // Cột Điểm
  ];

  // Thêm sheet vào workbook
  XLSX.utils.book_append_sheet(wb, ws, "Mẫu dữ liệu");

  // Xuất file
  XLSX.writeFile(wb, "Mau_nhap_diem_hoc_sinh.xlsx");

  playSelectionSound();
  alert("Đã tải mẫu file thành công!");
}

// Nhập dữ liệu từ Excel
function importExcelData() {
  const fileInput = document.getElementById("excelFileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Vui lòng chọn file Excel!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Lấy sheet đầu tiên
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Chuyển đổi sang JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        alert("File Excel không có dữ liệu hoặc chỉ có tiêu đề!");
        return;
      }

      // Tìm cột tên và điểm
      const headerRow = jsonData[0];
      let nameColIndex = -1;
      let pointsColIndex = -1;

      // Tìm cột tên (có thể là "Tên học sinh", "Tên", "Họ tên", "Name", etc.)
      for (let i = 0; i < headerRow.length; i++) {
        const header = String(headerRow[i] || "")
          .toLowerCase()
          .trim();
        if (
          header.includes("tên") ||
          header.includes("name") ||
          header.includes("họ tên")
        ) {
          nameColIndex = i;
        }
        if (
          header.includes("điểm") ||
          header.includes("points") ||
          header.includes("điểm số")
        ) {
          pointsColIndex = i;
        }
      }

      if (nameColIndex === -1) {
        alert(
          'Không tìm thấy cột tên học sinh! Vui lòng đảm bảo file có cột "Tên học sinh" hoặc "Tên".'
        );
        return;
      }

      if (pointsColIndex === -1) {
        alert(
          'Không tìm thấy cột điểm! Vui lòng đảm bảo file có cột "Điểm" hoặc "Điểm số".'
        );
        return;
      }

      // Xử lý dữ liệu
      let updatedCount = 0;
      let createdCount = 0;
      let errorCount = 0;
      const errors = [];

      pushUndo();

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const studentName = String(row[nameColIndex] || "").trim();
        const pointsValue = row[pointsColIndex];

        if (!studentName) continue;

        // Chuyển đổi điểm sang số
        let points = 0;
        if (
          pointsValue !== undefined &&
          pointsValue !== null &&
          pointsValue !== ""
        ) {
          points = parseFloat(pointsValue);
          if (isNaN(points)) {
            errors.push(
              `Dòng ${
                i + 1
              }: "${studentName}" - Điểm không hợp lệ: ${pointsValue}`
            );
            errorCount++;
            continue;
          }
        }

        // Tìm học sinh theo tên (không phân biệt hoa thường)
        let student = students.find(
          (s) => s.name.toLowerCase().trim() === studentName.toLowerCase()
        );

        if (student) {
          // Cập nhật điểm cho học sinh đã tồn tại
          const oldPoints = student.points;
          student.points = points;

          // Lưu lịch sử điểm
          if (!student.history) student.history = [];
          const pointChange = points - oldPoints;
          if (pointChange !== 0) {
            student.history.push({
              date: new Date().toISOString(),
              points: pointChange,
              total: student.points,
            });

            // Lưu vào lịch sử tập trung
            addToHistory(
              student.id,
              student.name,
              pointChange,
              student.points,
              "import"
            );
          }

          updatedCount++;
        } else {
          // Tạo học sinh mới
          const maxId =
            students.length > 0 ? Math.max(...students.map((s) => s.id)) : 0;
          const newStudent = {
            id: maxId + 1,
            name: studentName,
            points: points,
            history: [
              {
                date: new Date().toISOString(),
                points: points,
                total: points,
              },
            ],
          };
          students.push(newStudent);

          // Lưu vào lịch sử tập trung
          addToHistory(
            newStudent.id,
            newStudent.name,
            points,
            newStudent.points,
            "import"
          );

          createdCount++;
        }
      }

      // Lưu dữ liệu
      saveStudents();
      renderStudents();
      renderGroupGrid();
      renderGroupsGrid();
      updateHomeStats();
      renderTopStudents();
      renderTopGroups();

      // Hiển thị kết quả
      let message = `✅ Nhập dữ liệu thành công!\n\n`;
      message += `📊 Đã cập nhật: ${updatedCount} học sinh\n`;
      message += `➕ Đã tạo mới: ${createdCount} học sinh\n`;
      if (errorCount > 0) {
        message += `⚠️ Lỗi: ${errorCount} dòng\n\n`;
        message += `Chi tiết lỗi:\n${errors.join("\n")}`;
      }

      alert(message);

      // Reset file input
      fileInput.value = "";

      // Đóng modal sau khi import thành công
      closeImportExcelModal();

      // Phát âm thanh thành công
      playGameSound("success");
    } catch (error) {
      console.error("Lỗi đọc file Excel:", error);
      alert(
        "Lỗi khi đọc file Excel: " +
          error.message +
          "\n\nVui lòng kiểm tra lại file và thử lại."
      );
    }
  };

  reader.onerror = function () {
    alert("Lỗi khi đọc file! Vui lòng thử lại.");
  };

  reader.readAsArrayBuffer(file);
}

// Game particles effect
function createParticles() {
  const particlesContainer = document.getElementById("particles");
  const particleCount = 20;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 6 + "s";
    particle.style.animationDuration = Math.random() * 3 + 4 + "s";
    particlesContainer.appendChild(particle);
  }
}

// Enhanced button click effects
function addClickEffect(element) {
  element.addEventListener("click", function (e) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement("div");
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

    element.style.position = "relative";
    element.style.overflow = "hidden";
    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
}

// Add ripple effect CSS
const style = document.createElement("style");
style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
document.head.appendChild(style);

// Hàm phát âm thanh chúc mừng khi lên cấp
function playLevelUpSound(audioContext) {
  // Giai điệu chúc mừng: C-E-G-C (quãng tám) - vui vẻ và chúc mừng
  const notes = [
    { freq: 523, time: 0.0, duration: 0.15 }, // C
    { freq: 659, time: 0.1, duration: 0.15 }, // E
    { freq: 784, time: 0.2, duration: 0.15 }, // G
    { freq: 1047, time: 0.3, duration: 0.2 }, // C (cao)
    { freq: 1047, time: 0.5, duration: 0.1 }, // C (cao) - lặp lại
    { freq: 1319, time: 0.6, duration: 0.3 }, // E (cao) - kết thúc vui vẻ
  ];

  notes.forEach((note) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      note.freq,
      audioContext.currentTime + note.time
    );

    // Tăng volume cho nốt đầu và cuối để tạo cảm giác chúc mừng
    const volume = note.time === 0.0 || note.time >= 0.5 ? 0.15 : 0.12;
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.time);
    gainNode.gain.linearRampToValueAtTime(
      volume,
      audioContext.currentTime + note.time + 0.05
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + note.time + note.duration
    );

    oscillator.start(audioContext.currentTime + note.time);
    oscillator.stop(audioContext.currentTime + note.time + note.duration);
  });
}

// Game-like sound effects (optional)
function playGameSound(type) {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    if (type === "levelup") {
      // Tạo âm thanh chúc mừng với nhiều nốt vui vẻ
      playLevelUpSound(audioContext);
      return; // Return sớm vì đã xử lý riêng
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case "click":
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(
          600,
          audioContext.currentTime + 0.1
        );
        break;
      case "success":
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(
          659,
          audioContext.currentTime + 0.1
        );
        oscillator.frequency.setValueAtTime(
          784,
          audioContext.currentTime + 0.2
        );
        break;
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    // Audio not supported
  }
}

// Enhanced updateStudentPoints with game effects
const originalUpdateStudentPoints = updateStudentPoints;
updateStudentPoints = function (studentId, change) {
  originalUpdateStudentPoints(studentId, change);
  playGameSound(change > 0 ? "success" : "click");

  // Add visual feedback
  const student = students.find((s) => s.id === studentId);
  if (student) {
    const currentLevel = getCurrentLevel(student.points);
    const nextLevel = getNextLevel(student.points);

    // Check for level up
    if (currentLevel.name !== getCurrentLevel(student.points - change).name) {
      playGameSound("levelup");
      showLevelUpNotification(student.name, currentLevel.name);
    }
  }
};

// Level up notification - Hiển thị một thông báo
function showLevelUpNotification(studentName, newLevel) {
  const notification = document.createElement("div");
  notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #FFA726, #42A5F5);
            color: white;
            padding: 20px 40px;
            border-radius: 20px;
            font-size: 1.5rem;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: levelUpAnimation 2s ease-out forwards;
        `;
  notification.innerHTML = `🎉 ${studentName} đã lên cấp ${newLevel}! 🎉`;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 2000);
}

// Hiển thị nhiều thông báo lên cấp cùng lúc trong một hàng
function showMultipleLevelUpNotifications(levelUpStudents) {
  const container = document.createElement("div");
  container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            gap: 15px;
            z-index: 10000;
            animation: levelUpAnimation 2s ease-out forwards;
            flex-wrap: nowrap;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            max-width: 95vw;
            max-height: 90vh;
            overflow-x: hidden;
            overflow-y: auto;
            gap: 15px;
        `;

  // Tạo các thông báo tạm để đo chiều rộng
  const tempDivs = levelUpStudents.map(({ name, newLevel }) => {
    const temp = document.createElement("div");
    temp.style.cssText = `
                position: absolute;
                visibility: hidden;
                font-size: 1.5rem;
                font-weight: bold;
                padding: 20px 40px;
                white-space: nowrap;
            `;
    temp.textContent = `🎉 ${name} đã lên cấp ${newLevel}! 🎉`;
    document.body.appendChild(temp);
    return { temp, width: temp.offsetWidth };
  });

  // Tìm chiều rộng lớn nhất
  const maxWidth = Math.max(...tempDivs.map((d) => d.width));

  // Xóa các thẻ tạm
  tempDivs.forEach(({ temp }) => temp.remove());

  // Tạo các thông báo với chiều rộng bằng nhau
  const adjustedMaxWidth = Math.min(maxWidth, 400);
  const adjustedPadding = "15px 30px";
  const adjustedFontSize = "1.3rem";

  levelUpStudents.forEach(({ name, newLevel }) => {
    const notification = document.createElement("div");
    notification.style.cssText = `
                background: linear-gradient(135deg, #FFA726, #42A5F5);
                color: white;
                padding: ${adjustedPadding};
                border-radius: 20px;
                font-size: ${adjustedFontSize};
                font-weight: bold;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                text-align: center;
                width: ${adjustedMaxWidth}px;
                box-sizing: border-box;
                flex-shrink: 0;
                white-space: nowrap;
            `;
    notification.innerHTML = `🎉 ${name} đã lên cấp ${newLevel}! 🎉`;
    container.appendChild(notification);
  });

  document.body.appendChild(container);

  setTimeout(() => {
    container.remove();
  }, 2000);
}

// Add level up animation CSS
const levelUpStyle = document.createElement("style");
levelUpStyle.textContent = `
        @keyframes levelUpAnimation {
            0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
            }
            20% {
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 1;
            }
            80% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0;
            }
        }
    `;
document.head.appendChild(levelUpStyle);

// Hàm thiết lập điểm vua
function buildThresholdEditor() {
  const editor = document.getElementById("thresholdEditor");
  if (!editor) return;

  editor.innerHTML = levels
    .map(
      (level, index) => `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <label style="min-width: 120px; font-weight: bold;">${level.name}:</label>
                <input type="number" id="threshold-${index}" value="${level.points}" min="0" 
                        style="width: 80px; padding: 6px; border-radius: 6px; border: 1px solid #eee; text-align: center;" />
                <label style="min-width: 60px;">Hệ số:</label>
                <input type="number" id="multiplier-${index}" value="${level.multiplier}" min="1" step="0.25" 
                        style="width: 60px; padding: 6px; border-radius: 6px; border: 1px solid #eee; text-align: center;" />
            </div>
        `
    )
    .join("");
}

function buildThresholdTable() {
  const tableBody = document.getElementById("thresholdTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = levels
    .map(
      (level) => `
            <tr>
                <td style="padding: 8px; border: 1px solid #dee2e6;">${level.name}</td>
                <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">${level.points}</td>
                <td style="padding: 8px; border: 1px solid #dee2e6; text-align: center;">${level.multiplier}</td>
            </tr>
        `
    )
    .join("");
}

function saveThresholds() {
  levels.forEach((level, index) => {
    const pointsInput = document.getElementById(`threshold-${index}`);
    const multiplierInput = document.getElementById(`multiplier-${index}`);

    if (pointsInput) level.points = parseInt(pointsInput.value) || 0;
    if (multiplierInput)
      level.multiplier = parseFloat(multiplierInput.value) || 1;
  });

  saveLevels();
  buildThresholdTable();
  alert("Đã lưu thiết lập điểm!");
}

// Biến để theo dõi chế độ chọn nhiều nhóm
let isSelectingGroups = false;
let selectedGroups = new Set();

// Biến để theo dõi chế độ hiển thị học sinh
let isCompactView = false;

// Hàm chuyển đổi giao diện học sinh
function toggleStudentView() {
  isCompactView = !isCompactView;
  const toggleBtn = document.getElementById("viewToggleBtn");

  if (isCompactView) {
    toggleBtn.textContent = "Thẻ nhỏ";
    toggleBtn.style.background = "linear-gradient(45deg, #FFA726, #FFD54F)";
  } else {
    toggleBtn.textContent = "Thẻ lớn";
    toggleBtn.style.background = "linear-gradient(45deg, #42A5F5, #FF7043)";
  }

  renderStudents();
}

// Hàm render học sinh - hỗ trợ 2 chế độ
function renderStudents() {
  const grid = document.getElementById("studentGrid");
  if (!grid) return;

  // Sắp xếp theo alphabet
  const sortedStudents = [...students].sort((a, b) =>
    a.name.localeCompare(b.name, "vi")
  );

  if (isCompactView) {
    // Chế độ compact - nhiều học sinh trên một dòng
    grid.className = "student-grid-compact";
    grid.innerHTML = "";

    sortedStudents.forEach((student) => {
      const currentLevel = getCurrentLevel(student.points);
      const progress = getProgressPercentage(student.points);

      const card = document.createElement("div");
      card.className = "student-card-compact";
      if (isSelectMultipleMode) {
        card.classList.add("selectable");
        card.style.cursor = "pointer";
        // Thêm sự kiện click vào thẻ để toggle checkbox
        card.onclick = function (e) {
          // Không toggle nếu click vào checkbox, button, hoặc input
          if (
            e.target.type === "checkbox" ||
            e.target.tagName === "BUTTON" ||
            e.target.tagName === "INPUT" ||
            e.target.closest("button") ||
            e.target.closest("input")
          ) {
            return;
          }
          const checkbox = document.getElementById(
            `student-select-${student.id}`
          );
          if (checkbox) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event("change"));
          }
        };
      }

      // Xác định màu badge dựa trên điểm
      const badgeColor =
        student.points >= 0
          ? "linear-gradient(135deg, #4caf50, #66bb6a)"
          : "linear-gradient(135deg, #f44336, #e57373)";

      card.innerHTML = `
                    <div class="student-header-compact">
                        ${
                          isSelectMultipleMode
                            ? `<input type="checkbox" class="student-select" id="student-select-${student.id}" style="margin-right: 8px; width: 18px; height: 18px; cursor: pointer;" />`
                            : ""
                        }
                        <div class="student-info-compact">
                            <div style="position:relative; display:inline-block; margin-bottom:8px; overflow:visible;">
                                <div class="student-avatar-compact" style="background: ${
                                  currentLevel.color
                                }; width: 60px; height: 60px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto; overflow:hidden; position:relative;">
                                    <img src="${getLevelImage(
                                      currentLevel.name
                                    )}" alt="${
        currentLevel.name
      }" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                    <span style="display:none; font-size:2.5rem; align-items:center; justify-content:center;">${
                                      currentLevel.icon
                                    }</span>
                                </div>
                                <div id="points-${
                                  student.id
                                }" style="position:absolute; top:-6px; right:-6px; background:${badgeColor}; color:#fff; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:0.95rem; font-weight:bold; border:2.5px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.2); z-index:10; animation:characterFloat 3s ease-in-out infinite alternate;">${
        student.points
      }</div>
                            </div>
                            <div class="student-name-compact" style="text-align: center; font-size: 1.2rem;">${
                              student.name
                            }</div>
                            <div class="student-level-compact">
                                ${currentLevel.name}
                            </div>
                        </div>
                    </div>
                    <div class="student-progress-compact" ${
                      isSelectMultipleMode
                        ? `onclick="if(event.target.closest('button') === null && event.target.closest('input') === null) { const cb = document.getElementById('student-select-${student.id}'); if(cb) { cb.checked = !cb.checked; cb.dispatchEvent(new Event('change')); } }" style="cursor: pointer;"`
                        : ""
                    }>
                        <div class="student-progress-fill-compact" style="width: ${progress}%; background: ${getLevelGradient(
        currentLevel.name
      )};"></div>
                    </div>
                    <div class="student-controls-compact">
                        <button class="btn-compact subtract" onclick="applyCompactAmount(${
                          student.id
                        }, false)">−</button>
                        <input type="number" class="input-compact" id="compact-amount-${
                          student.id
                        }" value="1" min="1" />
                        <button class="btn-compact add" onclick="applyCompactAmount(${
                          student.id
                        }, true)">+</button>
                    </div>
                `;
      grid.appendChild(card);
    });
  } else {
    // Chế độ thẻ lớn - 6 học sinh mỗi dòng
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(6, 1fr)";
    grid.style.gap = "20px";
    grid.innerHTML = "";

    sortedStudents.forEach((student) => {
      const currentLevel = getCurrentLevel(student.points);
      const nextLevel = getNextLevel(student.points);
      const progress = getProgressPercentage(student.points);

      const studentCard = document.createElement("div");
      studentCard.className = "student-card";
      if (isSelectMultipleMode) {
        studentCard.style.cursor = "pointer";
        // Thêm sự kiện click vào thẻ để toggle checkbox
        studentCard.onclick = function (e) {
          // Không toggle nếu click vào checkbox, button, hoặc input
          if (
            e.target.type === "checkbox" ||
            e.target.tagName === "BUTTON" ||
            e.target.tagName === "INPUT" ||
            e.target.closest("button") ||
            e.target.closest("input")
          ) {
            return;
          }
          const checkbox = document.getElementById(
            `student-select-${student.id}`
          );
          if (checkbox) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event("change"));
          }
        };
      }
      // Xác định màu badge dựa trên điểm
      const badgeColor =
        student.points >= 0
          ? "linear-gradient(135deg, #4caf50, #66bb6a)"
          : "linear-gradient(135deg, #f44336, #e57373)";

      studentCard.innerHTML = `
                    ${
                      isSelectMultipleMode
                        ? `<div style="display: flex; justify-content: flex-end; margin-bottom: 6px;"><input type="checkbox" class="student-select" id="student-select-${student.id}" style="width: 16px; height: 16px; cursor: pointer;" /></div>`
                        : ""
                    }
                    <div class="student-name" style="margin-bottom:8px;">${
                      student.name
                    }</div>
                    <div class="character-level" style="position:relative; overflow:visible;">
                        <div class="character-image" style="background: ${
                          currentLevel.color
                        };">
                            <img src="${getLevelImage(
                              currentLevel.name
                            )}" alt="${
        currentLevel.name
      }" style="width: 82px; height: 82px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                            <span style="display: none;">${
                              currentLevel.icon
                            }</span>
                        </div>
                        <div id="points-${
                          student.id
                        }" style="position:absolute; top:2px; left:calc(50% + 38px); background:${badgeColor}; color:#fff; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:bold; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.2); z-index:10; animation: characterFloat 3s ease-in-out infinite alternate;">${
        student.points
      }</div>
                        <div class="level-name">${currentLevel.name}</div>
                    </div>
                    <div class="progress-bar" ${
                      isSelectMultipleMode
                        ? `onclick="if(event.target.closest('button') === null && event.target.closest('input') === null) { const cb = document.getElementById('student-select-${student.id}'); if(cb) { cb.checked = !cb.checked; cb.dispatchEvent(new Event('change')); } }" style="cursor: pointer;"`
                        : ""
                    }>
                        <div class="progress-fill" style="width: ${progress}%; background: ${getLevelGradient(
        currentLevel.name
      )}">
                            <div class="progress-text">${Math.round(
                              progress
                            )}%</div>
                        </div>
                    </div>
                    <div class="controls" style="gap:5px; display:flex; justify-content:center; align-items:center;">
                        <button class="btn btn-subtract" onclick="applyAmount(${
                          student.id
                        }, false)" style="padding:5px 10px; font-size:0.85rem; order:1;">-</button>
                        <input type="number" id="amount-${
                          student.id
                        }" value="1" min="1" step="1" style="width:75px; padding:6px 6px; border-radius:6px; border:1px solid #eee; text-align:center; font-size:0.95rem; order:2; cursor: text; background: white;" />
                        <button class="btn btn-add" onclick="applyAmount(${
                          student.id
                        }, true)" style="padding:5px 10px; font-size:0.85rem; order:3;">+</button>
                    </div>
                `;
      grid.appendChild(studentCard);
    });
  }

  updateHomeStats();
}

// Hàm bật/tắt chế độ chọn nhiều nhóm
function toggleSelectGroups() {
  isSelectingGroups = !isSelectingGroups;
  selectedGroups.clear();

  const selectBtn = document.getElementById("selectGroupsBtn");
  const selectAllBtn = document.getElementById("selectAllGroupsBtn");
  const bulkControls = document.getElementById("groupBulkControls");

  if (isSelectingGroups) {
    selectBtn.textContent = "Hủy chọn";
    selectBtn.style.background = "linear-gradient(45deg, #ff4757, #ff6b6b)";
    selectAllBtn.style.display = "inline-block";
    bulkControls.style.display = "flex";
  } else {
    selectBtn.textContent = "Chọn nhiều";
    selectBtn.style.background = "linear-gradient(45deg, #ff6b6b, #ff8e8e)";
    selectAllBtn.style.display = "none";
    bulkControls.style.display = "none";
  }

  renderGroupsGrid();
}

// Hàm chọn tất cả nhóm
function selectAllGroups() {
  if (!isSelectingGroups) return;

  selectedGroups.clear();
  groups.forEach((group) => selectedGroups.add(group.id));
  renderGroupsGrid();
}

// Hàm thêm/xóa nhóm khỏi danh sách chọn
function toggleGroupSelection(groupId) {
  if (!isSelectingGroups) return;

  if (selectedGroups.has(groupId)) {
    selectedGroups.delete(groupId);
  } else {
    selectedGroups.add(groupId);
  }
  renderGroupsGrid();
}

// Hàm thêm điểm cho các nhóm đã chọn
function addPointsToSelectedGroups() {
  if (selectedGroups.size === 0) {
    alert("Vui lòng chọn ít nhất một nhóm!");
    return;
  }

  const points =
    parseInt(document.getElementById("groupBulkPoints").value) || 1;
  // Lưu lại danh sách ID nhóm và học sinh trước khi cập nhật
  const groupIds = Array.from(selectedGroups);
  const studentIdsToHighlight = new Set();
  groupIds.forEach((groupId) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      group.studentIds.forEach((id) => studentIdsToHighlight.add(id));
    }
  });

  selectedGroups.forEach((groupId) => {
    addPointsToGroup(points, groupId);
  });

  // Phát âm thanh khi cộng điểm cho nhiều nhóm
  playGameSound("success");
  // Highlight điểm của tất cả học sinh trong các nhóm đã chọn
  setTimeout(() => {
    studentIdsToHighlight.forEach((id) => {
      highlightPoints(`points-${id}`);
    });
  }, 100);
  // Xóa khỏi Set và render lại để bỏ tích checkbox
  selectedGroups.clear();
  renderGroupsGrid();
}

// Hàm trừ điểm cho các nhóm đã chọn
function subtractPointsFromSelectedGroups() {
  if (selectedGroups.size === 0) {
    alert("Vui lòng chọn ít nhất một nhóm!");
    return;
  }

  const points =
    parseInt(document.getElementById("groupBulkPoints").value) || 1;
  // Lưu lại danh sách ID nhóm và học sinh trước khi cập nhật
  const groupIds = Array.from(selectedGroups);
  const studentIdsToHighlight = new Set();
  groupIds.forEach((groupId) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      group.studentIds.forEach((id) => studentIdsToHighlight.add(id));
    }
  });

  selectedGroups.forEach((groupId) => {
    addPointsToGroup(-points, groupId);
  });

  // Phát âm thanh khi trừ điểm cho nhiều nhóm
  playGameSound("click");
  // Highlight điểm của tất cả học sinh trong các nhóm đã chọn
  setTimeout(() => {
    studentIdsToHighlight.forEach((id) => {
      highlightPoints(`points-${id}`);
    });
  }, 100);
  // Xóa khỏi Set và render lại để bỏ tích checkbox
  selectedGroups.clear();
  renderGroupsGrid();
}

// Hàm xóa các nhóm đã chọn
function deleteSelectedGroups() {
  if (selectedGroups.size === 0) {
    alert("Vui lòng chọn ít nhất một nhóm!");
    return;
  }

  if (confirm(`Bạn có chắc muốn xóa ${selectedGroups.size} nhóm đã chọn?`)) {
    selectedGroups.forEach((groupId) => {
      const groupIndex = groups.findIndex((g) => g.id === groupId);
      if (groupIndex !== -1) {
        groups.splice(groupIndex, 1);
      }
    });

    saveGroups();
    renderGroupsGrid();
    updateHomeStats();
    alert(`Đã xóa ${selectedGroups.size} nhóm!`);

    // Tắt chế độ chọn nhiều
    toggleSelectGroups();
  }
}

// Hàm hiển thị tab
function showTab(tabName) {
  // Ẩn tất cả tab
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Hiển thị tab được chọn
  const targetTab = document.getElementById(tabName + "-tab");
  if (targetTab) {
    targetTab.classList.add("active");
  }

  // Header không cần cập nhật vì sử dụng hình ảnh cố định

  // Cập nhật nav icon
  document.querySelectorAll(".nav-icon").forEach((icon) => {
    icon.classList.remove("active");
  });
  // Tìm element .nav-icon gần nhất từ event.target
  const clickedIcon = event.target.closest(".nav-icon");
  if (clickedIcon) {
    clickedIcon.classList.add("active");
  }

  // Ẩn/hiện cột bên phải (Top 5 học sinh và Top 3 nhóm)
  const mainContent = document.querySelector(".main-content");
  const rightSection = document.getElementById("rightSection");

  if (tabName === "home") {
    // Chỉ hiển thị cột phải ở trang chủ
    mainContent.classList.remove("hide-right");
    if (rightSection) {
      rightSection.style.display = "block";
    }
    // Hiển thị top 5 học sinh và top 3 nhóm
    document.querySelector(".members-card h3").textContent = "Top 5 học sinh";
    renderTopStudents();
    renderTopGroups();
    // Hiển thị lại top 3 nhóm
    document.querySelector(".my-devices-card").style.display = "block";
  } else {
    // Ẩn cột phải ở tất cả các tab khác
    mainContent.classList.add("hide-right");
    if (rightSection) {
      rightSection.style.display = "none";
    }
  }

  // Khởi tạo lại bảng điểm khi vào tab cài đặt
  if (tabName === "settings") {
    setTimeout(() => {
      loadPointItems();
      updateDeleteStudentSelect();
    }, 100);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  students = loadStudentsForWeek();
  renderStudents();
  renderGroupSelects();
  renderGroupGrid();
  buildThresholdEditor();
  buildThresholdTable();
  updateDeleteStudentSelect();
  updateHomeStats();
  renderMembersList();
  renderGroupsGrid();
  // setupSearch(); // Hàm này không tồn tại, đã comment
  renderTopStudents();
  renderTopGroups();

  // Initialize game effects
  createParticles();

  // Add click effects to all buttons
  document
    .querySelectorAll(".btn, .btn-compact, .btn-game, .nav-icon")
    .forEach((btn) => {
      addClickEffect(btn);
    });

  // Các nút bảng điểm đã sử dụng onclick trực tiếp
});

// ========== HÀM LỊCH SỬ CỘNG ĐIỂM ==========
let selectedHistoryItems = new Set();

function showHistoryModal() {
  document.getElementById("historyModal").style.display = "flex";
  selectedHistoryItems.clear();
  renderHistory();
  playSelectionSound();
}

function closeHistoryModal() {
  document.getElementById("historyModal").style.display = "none";
  selectedHistoryItems.clear();
  playSelectionSound();
}

function renderHistory() {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;

  // Lọc lịch sử 3 ngày gần nhất
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  threeDaysAgo.setHours(0, 0, 0, 0);

  const recentHistory = pointHistory
    .filter((item) => new Date(item.date) >= threeDaysAgo)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sắp xếp mới nhất trước

  if (recentHistory.length === 0) {
    historyList.innerHTML =
      '<div style="text-align:center; padding:40px; color:#666;">Không có lịch sử trong 3 ngày gần nhất</div>';
    updateDeleteButtonVisibility();
    return;
  }

  // Nhóm theo ngày
  const historyByDate = {};
  recentHistory.forEach((item) => {
    const date = new Date(item.date);
    const dateKey = date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!historyByDate[dateKey]) {
      historyByDate[dateKey] = [];
    }
    historyByDate[dateKey].push(item);
  });

  let html = "";
  Object.keys(historyByDate).forEach((dateKey) => {
    html += `<div style="margin-bottom:30px;">
                <h4 style="font-size:1.2rem; font-weight:700; color:#333; margin-bottom:15px; padding-bottom:10px; border-bottom:2px solid #eee;">${dateKey}</h4>`;

    historyByDate[dateKey].forEach((item) => {
      const time = new Date(item.date).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const pointsColor = item.points >= 0 ? "#28a745" : "#dc3545";
      const pointsSign = item.points >= 0 ? "+" : "";

      html += `
                    <div style="display:flex; align-items:center; gap:15px; padding:15px; background:#f8f9fa; border-radius:12px; margin-bottom:10px; transition:all 0.3s; cursor:pointer;" 
                            onmouseover="this.style.background='#e9ecef'" 
                            onmouseout="this.style.background='#f8f9fa'"
                            onclick="if(event.target.type !== 'checkbox' && event.target.tagName !== 'BUTTON' && !event.target.closest('button')) { const cb = document.getElementById('history-check-${
                              item.id
                            }'); if(cb) { cb.checked = !cb.checked; toggleHistorySelection(${
        item.id
      }); } }">
                        <input type="checkbox" 
                                id="history-check-${item.id}" 
                                onchange="toggleHistorySelection(${item.id})" 
                                onclick="event.stopPropagation();"
                                style="width:20px; height:20px; cursor:pointer; transform:scale(1.2);" />
                        <div style="flex:1; display:flex; align-items:center; gap:15px;">
                            <div style="min-width:80px; font-weight:600; color:#666;">${time}</div>
                            <div style="flex:1; font-weight:600; color:#333;">${
                              item.studentName
                            }</div>
                            <div style="min-width:100px; text-align:right; font-weight:700; color:${pointsColor};">
                                ${pointsSign}${item.points} điểm
                            </div>
                            <div style="min-width:80px; text-align:right; color:#666;">
                                Tổng: ${item.totalPoints}
                            </div>
                            <div style="min-width:100px; text-align:center;">
                                <span style="padding:4px 12px; background:#e9ecef; border-radius:8px; font-size:0.85rem; color:#666;">
                                    ${
                                      item.type === "individual"
                                        ? "Cá nhân"
                                        : item.type === "group"
                                        ? "Nhóm"
                                        : "Hàng loạt"
                                    }
                                </span>
                            </div>
                        </div>
                        <button onclick="deleteHistoryItem(${
                          item.id
                        }); event.stopPropagation();" 
                                style="background:#ff6b6b; color:white; border:none; padding:8px 16px; border-radius:8px; cursor:pointer; font-weight:600; font-size:1.2rem; min-width:40px;"
                                onmouseover="this.style.background='#ff4757'" 
                                onmouseout="this.style.background='#ff6b6b'">×</button>
                    </div>
                `;
    });

    html += "</div>";
  });

  historyList.innerHTML = html;
  updateDeleteButtonVisibility();
}

function toggleHistorySelection(itemId) {
  if (selectedHistoryItems.has(itemId)) {
    selectedHistoryItems.delete(itemId);
  } else {
    selectedHistoryItems.add(itemId);
  }
  updateDeleteButtonVisibility();
}

function updateDeleteButtonVisibility() {
  const deleteBtn = document.getElementById("deleteSelectedBtn");
  if (deleteBtn) {
    if (selectedHistoryItems.size > 0) {
      deleteBtn.style.display = "block";
      deleteBtn.textContent = `Xóa đã chọn (${selectedHistoryItems.size})`;
    } else {
      deleteBtn.style.display = "none";
    }
  }
}

function deleteHistoryItem(itemId) {
  if (!confirm("Bạn có chắc muốn xóa mục lịch sử này?")) return;

  const item = pointHistory.find((h) => h.id === itemId);
  if (!item) return;

  // Hoàn tác điểm: trừ điểm đã cộng
  const student = students.find((s) => s.id === item.studentId);
  if (student) {
    student.points = student.points - item.points;
    saveStudents();
    renderStudents();
    renderGroupGrid();
    updateHomeStats();
  }

  // Xóa khỏi lịch sử
  pointHistory = pointHistory.filter((h) => h.id !== itemId);
  savePointHistory();

  // Render lại
  renderHistory();
  playSelectionSound();
}

function deleteSelectedHistoryItems() {
  if (selectedHistoryItems.size === 0) {
    alert("Vui lòng chọn ít nhất một mục!");
    return;
  }

  if (
    !confirm(
      `Bạn có chắc muốn xóa ${selectedHistoryItems.size} mục lịch sử đã chọn?`
    )
  )
    return;

  // Hoàn tác điểm cho tất cả các mục đã chọn
  selectedHistoryItems.forEach((itemId) => {
    const item = pointHistory.find((h) => h.id === itemId);
    if (item) {
      const student = students.find((s) => s.id === item.studentId);
      if (student) {
        student.points = student.points - item.points;
      }
    }
  });

  // Xóa khỏi lịch sử
  pointHistory = pointHistory.filter((h) => !selectedHistoryItems.has(h.id));
  savePointHistory();

  // Lưu và render lại
  saveStudents();
  renderStudents();
  renderGroupGrid();
  updateHomeStats();

  selectedHistoryItems.clear();
  renderHistory();
  playSelectionSound();
}