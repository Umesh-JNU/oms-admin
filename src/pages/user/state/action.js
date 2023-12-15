
import axiosInstance from "../../../utils/axiosUtil";
import { getError } from "../../../utils/error";

export const create = async (dispatch, token, input) => {
  try {
    dispatch({ type: 'ADD_REQUEST' });
    const { data } = await axiosInstance.post(
      "/api/admin/user/create", input,
      { headers: { Authorization: token } }
    );

    setTimeout(() => {
      dispatch({ type: 'ADD_SUCCESS' });
    }, 1500);
  } catch (err) {
    dispatch({ type: "ADD_FAIL", payload: getError(err) });
  }
};

export const getAll = async (dispatch, token, curPage, resultPerPage, query) => {
  let url = `/api/admin/user/all/?keyword=${query}&resultPerPage=${resultPerPage}&currentPage=${curPage}`;

  try {
    dispatch({ type: "FETCH_REQUEST" });
    const { data } = await axiosInstance.get(
      url,
      { headers: { Authorization: token } }
    );
    console.log("all user", data);
    dispatch({ type: "FETCH_SUCCESS", payload: data });
  } catch (error) {
    dispatch({ type: "FETCH_FAIL", payload: getError(error) });
  }
};

export const del = async (dispatch, token, id) => {
  if (
    window.confirm(
      "Are you sure you want to delete this wholesaler?\n\nNote: Wholesaler's related all information and purchase will also be deleted."
    ) === true
  ) {
    try {
      dispatch({ type: "FETCH_REQUEST" });
      await axiosInstance.delete(`/api/admin/user/${id}`, {
        headers: { Authorization: token },
      });
      dispatch({ type: "DELETE_SUCCESS", payload: id });
    } catch (error) {
      dispatch({ type: "FETCH_FAIL", payload: getError(error) });
    }
  }
}

export const update = async (dispatch, token, id, userInfo) => {
  try {
    dispatch({ type: "UPDATE_REQUEST" });

    await axiosInstance.put(`/api/admin/user/${id}`, userInfo, {
      headers: { Authorization: token },
    });

    setTimeout(() => {
      dispatch({ type: "UPDATE_SUCCESS" });
    }, 2000);
  } catch (err) {
    dispatch({ type: "UPDATE_FAIL", payload: getError(err) });
  }
};

export const updateActive = async (dispatch, token, id, active) => {
  const act_sts = active ? false : true;
  console.log({ active, act_sts });
  try {
    dispatch({
      type: "UPDATE_ACTIVE_REQUEST",
      payload: { user_id: id, activeStatus: act_sts },
    });

    await axiosInstance.put(`/api/admin/user/${id}`, { active: act_sts },
      { headers: { Authorization: token } }
    );

    dispatch({ type: "UPDATE_ACTIVE_SUCCESS" });
  } catch (error) {
    dispatch({
      type: "UPDATE_ACTIVE_FAIL",
      payload: { user_id: id, activeStatus: act_sts, error: getError(error) }
    });
  }
};

export const getDetails = async (dispatch, token, id) => {
  // console.log(token, id);
  try {
    dispatch({ type: "FETCH_DETAILS_REQUEST" });

    const { data } = await axiosInstance.get(`/api/admin/user/${id}`, {
      headers: { Authorization: token },
    });

    console.log("user", data);
    dispatch({ type: "FETCH_DETAILS_SUCCESS", payload: data });
  } catch (err) {
    dispatch({
      type: "FETCH_DETAILS_FAIL",
      payload: getError(err),
    });
  }
};