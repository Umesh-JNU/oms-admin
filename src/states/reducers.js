export const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, data: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false, success: true };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "CLEAR_SUCCESS":
      return { ...state, success: false };

    default:
      return state;
  }
};