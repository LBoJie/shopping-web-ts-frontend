export default (error: any): void => {
  let errorMessage = error; // 通用的錯誤訊息

  if (error.response && error.response._data && error.response._data.responseData) {
    // API 有特定的錯誤訊息
    errorMessage = error.response._data.responseData;
  } else if (typeof error === "string") {
    // 如果錯誤是一個字符串，直接顯示
    errorMessage = error;
  } else if (error.message) {
    // 如果錯誤有 message 屬性，使用它
    errorMessage = error.message;
  }

  alert(errorMessage); // 使用 alert 顯示錯誤
};
