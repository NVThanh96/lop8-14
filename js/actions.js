// Hàm reset toàn bộ điểm số và lịch sử
function resetAllPoints() {
  if (
    !confirm(
      "Bạn có chắc chắn muốn RESET TOÀN BỘ ĐIỂM SỐ của tất cả học sinh và nhóm?\n\nHành động này KHÔNG THỂ hoàn tác và sẽ xóa toàn bộ lịch sử điểm trong history.json!"
    )
  ) {
    return;
  }

  if (
    !confirm("XÁC NHẬN LẦN CUỐI: Bạn thực sự muốn xóa sạch điểm và lịch sử?")
  ) {
    return;
  }

  // 1. Reset điểm học sinh về 0
  students.forEach((student) => {
    student.points = 0;
    // Xóa lịch sử cá nhân nếu còn (tùy chọn)
    if (student.history) {
      student.history = [];
    }
  });

  // 2. Reset điểm nhóm về 0 (trong mảng groups)
  groups.forEach((group) => {
    if (typeof group.points !== "undefined") {
      group.points = 0;
    }
  });

  // 3. XÓA TOÀN BỘ LỊCH SỬ trong history.json
  historyLog = []; // Xóa mảng toàn cục
  saveHistoryToFile(); // Ghi đè file history.json bằng mảng rỗng

  // 4. Lưu dữ liệu chính
  saveToJson(); // Lưu data.json (học sinh, levels, criteria...)
  saveGroups(); // ← QUAN TRỌNG: Lưu groups.json để reset điểm nhóm bền vững

  // 5. Cập nhật toàn bộ giao diện
  renderStudents();
  renderGroupGrid();
  renderGroupsGrid();
  renderTopStudents();
  renderTopGroups();
  updateHomeStats();

  // 6. Cập nhật tab lịch sử (hiển thị trống)
  renderHistory?.();

  // 7. Thông báo thành công
  alert(
    "Đã reset toàn bộ điểm số của học sinh, nhóm và xóa sạch lịch sử thành công!"
  );

  // Phát âm thanh
  playGameSound("success");
}

// Hàm thêm điểm cho các học sinh được chọn trong chế độ chọn nhiều
function addPointsToSelected() {
  const pointsInput = document.getElementById("bulkPoints");
  const points = parseInt(pointsInput.value) || 1;

  const selectedCheckboxes = document.querySelectorAll(
    ".student-select:checked"
  );
  const selectedStudents = Array.from(selectedCheckboxes).map((cb) =>
    parseInt(cb.id.replace("student-select-", ""))
  );

  if (selectedStudents.length === 0) {
    alert("Vui lòng chọn ít nhất một học sinh.");
    return;
  }

  pushUndo();
  const levelUpStudents = []; // Danh sách học sinh lên cấp

  selectedStudents.forEach((id) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;

    // Lấy level hiện tại để tính multiplier
    const currentLevel = getCurrentLevel(student.points);
    const oldLevel = currentLevel; // Để so sánh lên cấp
    const adjusted = Math.round(points * (currentLevel.multiplier || 1));

    // Cộng điểm
    student.points += adjusted;

    // Kiểm tra lên cấp
    const newLevel = getCurrentLevel(student.points);
    if (oldLevel.name !== newLevel.name) {
      levelUpStudents.push({
        id: student.id,
        name: student.name,
        newLevel: newLevel.name,
      });
    }

    // === LƯU LỊCH SỬ VÀO history.json (thay vì addToHistory cũ) ===
    addToStudentHistory(
      student.id,
      student.name,
      adjusted,
      student.points,
      "bulk"
    );
  });

  // Lưu data.json (điểm học sinh mới)
  saveToJson();

  // Cập nhật giao diện
  renderStudents();
  renderGroupGrid();
  updateHomeStats();
  renderTopStudents(); // Nếu có top cá nhân

  // Phát âm thanh
  playGameSound("success");

  // Thông báo lên cấp (nếu có)
  if (levelUpStudents.length > 0) {
    playGameSound("levelup");
    showMultipleLevelUpNotifications(levelUpStudents);
  }

  // Highlight điểm của các học sinh đã chọn
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

  // Xóa giá trị input và bỏ chọn tất cả checkbox (tùy chọn)
  pointsInput.value = 1;
  selectedCheckboxes.forEach((cb) => (cb.checked = false));
}

// Hàm trừ điểm cho các học sinh được chọn trong chế độ chọn nhiều
function subtractPointsFromSelected() {
  const pointsInput = document.getElementById("bulkPoints");
  const points = parseInt(pointsInput.value) || 1;

  const selectedCheckboxes = document.querySelectorAll(
    ".student-select:checked"
  );
  const selectedStudents = Array.from(selectedCheckboxes).map((cb) =>
    parseInt(cb.id.replace("student-select-", ""))
  );

  if (selectedStudents.length === 0) {
    alert("Vui lòng chọn ít nhất một học sinh để trừ điểm.");
    return;
  }

  pushUndo();

  selectedStudents.forEach((id) => {
    const student = students.find((s) => s.id === id);
    if (!student) return;

    // Tính multiplier dựa trên cấp độ hiện tại
    const currentLevel = getCurrentLevel(student.points);
    const adjusted = Math.round(points * (currentLevel.multiplier || 1));

    // Trừ điểm (điểm âm)
    student.points -= adjusted;

    // Đảm bảo điểm không âm (tùy bạn muốn cho âm hay không)
    if (student.points < 0) {
      student.points = 0; // Hoặc bỏ dòng này nếu cho phép điểm âm
    }

    // === LƯU LỊCH SỬ VÀO history.json (điểm âm, type "bulk") ===
    addToStudentHistory(
      student.id,
      student.name,
      -adjusted,
      student.points,
      "bulk"
    );
  });

  // Lưu data.json (điểm mới của học sinh)
  saveToJson();

  // Cập nhật giao diện
  renderStudents();
  renderGroupGrid();
  updateHomeStats();
  renderTopStudents(); // Nếu có top cá nhân

  // Phát âm thanh trừ điểm
  playGameSound("click");

  // Highlight điểm của các học sinh đã chọn
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

  // Reset input và bỏ chọn checkbox (tùy chọn)
  pointsInput.value = 1;
  selectedCheckboxes.forEach((cb) => (cb.checked = false));
}

// Hàm xóa các mục lịch sử đã chọn và hoàn tác điểm tương ứng
function deleteSelectedHistoryItems() {
  if (selectedHistoryItems.size === 0) {
    alert("Vui lòng chọn ít nhất một mục để xóa!");
    return;
  }

  if (
    !confirm(
      `Bạn có chắc muốn xóa ${selectedHistoryItems.size} mục lịch sử đã chọn không?\n\nHành động này sẽ HOÀN TÁC điểm tương ứng của các học sinh liên quan.`
    )
  ) {
    return;
  }

  let pointsChanged = false;
  const idsToDelete = Array.from(selectedHistoryItems);

  idsToDelete.forEach((recordId) => {
    const index = historyLog.findIndex(
      (item) => (item.recordId || "") === recordId
    );
    if (index === -1) return;

    const item = historyLog[index];

    // Hoàn tác điểm
    const student = students.find((s) => s.id === item.studentId);
    if (student) {
      student.points -= item.points;
      pointsChanged = true;
    }

    // Xóa khỏi mảng
    historyLog.splice(index, 1);
  });

  // Xóa hết trong Set
  selectedHistoryItems.clear();

  // Lưu history.json
  saveHistoryToFile();

  // Nếu có thay đổi điểm → lưu data.json và render lại
  if (pointsChanged) {
    saveToJson();
    renderStudents();
    renderTopStudents();
    renderGroupGrid();
    updateHomeStats();
  }

  // Cập nhật giao diện lịch sử
  renderHistory();
  updateDeleteButtonVisibility();

  playSelectionSound();

  alert(
    `Đã xóa thành công ${idsToDelete.length} mục và hoàn tác điểm tương ứng!`
  );
}

// Hàm xóa một mục lịch sử cụ thể và hoàn tác điểm tương ứng
function deleteHistoryItem(recordId) {
  if (
    !confirm(
      "Bạn có chắc muốn xóa mục lịch sử này không?\n\nHành động này sẽ HOÀN TÁC điểm tương ứng của học sinh."
    )
  ) {
    return;
  }

  const index = historyLog.findIndex(
    (item) => (item.recordId || "") === recordId
  );
  if (index === -1) {
    alert("Không tìm thấy mục lịch sử này!");
    return;
  }

  const item = historyLog[index];

  let pointsChanged = false;

  // === HOÀN TÁC ĐIỂM CHO HỌC SINH ===
  const student = students.find((s) => s.id === item.studentId);
  if (student) {
    student.points -= item.points; // Hoàn tác chính xác hành động trước
    pointsChanged = true;
  }

  // Xóa khỏi mảng historyLog
  historyLog.splice(index, 1);

  // === LƯU LẠI history.json ===
  saveHistoryToFile();

  // Nếu có thay đổi điểm → lưu data.json và cập nhật giao diện
  if (pointsChanged) {
    saveToJson();
    renderStudents();
    renderTopStudents();
    renderGroupGrid();
    updateHomeStats();
  }

  // Cập nhật lại tab lịch sử
  renderHistory();

  // Xóa khỏi selected nếu đang chọn
  selectedHistoryItems.delete(recordId);
  updateDeleteButtonVisibility();

  playSelectionSound();
}

// Cập nhật trạng thái checkbox "Chọn tất cả" dựa trên các mục đã chọn
function updateSelectAllCheckboxState(recentHistory) {
  const selectAllCb = document.getElementById("select-all-history");
  if (!selectAllCb) return;

  if (recentHistory.length === 0) {
    selectAllCb.checked = false;
    selectAllCb.disabled = true;
    return;
  }

  // Đếm số checkbox con được chọn
  let checkedCount = 0;
  document
    .querySelectorAll(
      '#historyList input[type="checkbox"]:not(#select-all-history)'
    )
    .forEach((cb) => {
      const recordId = cb.id.replace("history-check-", "");
      if (selectedHistoryItems.has(recordId)) checkedCount++;
    });

  const total = recentHistory.length;
  selectAllCb.checked = checkedCount === total;
  selectAllCb.disabled = false;

  // Indeterminate nếu một phần được chọn
  selectAllCb.indeterminate = checkedCount > 0 && checkedCount < total;
}
