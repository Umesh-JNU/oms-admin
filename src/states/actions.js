import axiosInstance from "../utils/axiosUtil";
import { getError } from "../utils/error";

export const login = async (ctxDispatch, dispatch, credentials) => {
  try {
    dispatch({ type: "FETCH_REQUEST" });
    const { data } = await axiosInstance.post("/api/user/login", credentials);

    console.log("data", data);
    if (data.token) {
      ctxDispatch({ type: "USER_SIGNIN", payload: data });
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      localStorage.setItem("token", JSON.stringify(data.token));

      dispatch({ type: "FETCH_SUCCESS" });
    }
    else {
      dispatch({ type: "FETCH_FAIL", payload: getError(data) });
    }
  }
  catch (err) {
    dispatch({ type: "FETCH_FAIL", payload: getError(err) });
  }
};

export const clearErrors = async (dispatch) => {
  dispatch({ type: 'CLEAR_ERROR' });
};

export const clearSuccess = async (dispatch) => {
  setTimeout(() => {
    dispatch({ type: 'CLEAR_SUCCESS' });
  }, 2000);
}

export const getProfile = async (dispatch, token) => {
  try {
    dispatch({ type: "FETCH_REQUEST" });
    const { data } = await axiosInstance.get("/api/user/profile",
      { headers: { Authorization: token } }
    );

    console.log("data", data);
    if (data) {
      dispatch({ type: "FETCH_SUCCESS", payload: data.user });
    }
    else {
      dispatch({ type: "FETCH_FAIL", payload: getError(data) });
    }
  } catch (err) {
    dispatch({ type: "FETCH_FAIL", payload: getError(err) });
  }
}

export const updateProfile = async (ctxDispatch, dispatch, token, userInfo) => {
  try {
    dispatch({ type: "UPDATE_REQUEST" });

    const { data } = await axiosInstance.put(`/api/user/update-profile`, userInfo, {
      headers: { Authorization: token },
    });
    console.log("update profile", { data })
    setTimeout(() => {
      ctxDispatch({ type: "PROFILE_UPDATE", payload: data.user });
      dispatch({ type: "UPDATE_SUCCESS" });
    }, 2000);
  } catch (err) {
    dispatch({ type: "UPDATE_FAIL", payload: getError(err) });
  }
};