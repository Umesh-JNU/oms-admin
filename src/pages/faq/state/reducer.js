export default function faqReducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
    case "ADD_REQUEST":
    case "FETCH_DETAILS_REQUEST":
    case "UPDATE_DETAILS_REQUEST":
      return { ...state, loading: true };

    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true };

    case "FETCH_SUCCESS":
      return {
        ...state,
        faqs: action.payload.faqs,
        faqsCount: action.payload.filteredFAQCount,
        loading: false,
      };

    case "FETCH_DETAILS_SUCCESS":
      return {
        ...state,
        loading: false,
        faq: action.payload.faq
      };
    case "ADD_SUCCESS":
      return { ...state, loading: false, success: true };

    case "UPDATE_DETAILS_SUCCESS":
      return {
        ...state,
        loading: false,
        faq: action.payload.faq,
        faqs: action.payload.faqs
      };

    case "UPDATE_SUCCESS":
      return {
        ...state,
        loadingUpdate: false,
        success: true
      };

    case "DELETE_SUCCESS":
      const deletedfaqId = action.payload;
      const updatedfaqs = state.faqs.filter(faq => faq._id !== deletedfaqId);
      const updatedfaqsCount = state.faqsCount - 1;
      return {
        ...state,
        faqs: updatedfaqs,
        faqsCount: updatedfaqsCount,
        loading: false
      };

    case "FETCH_FAIL":
    case "ADD_FAIL":
    case "FETCH_DETAILS_FAIL":
    case "UPDATE_DETAILS_FAIL":
    case "UPDATE_FAIL":
      return { ...state, loading: false, loadingUpdate: false, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
};