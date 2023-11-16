import axiosInstance from "./axiosUtil";
import { getError } from "./error";

export const uploadFile = async (file, fileType, token, percentHandler) => {
  try {
    const bodyFormData = new FormData();
    switch (fileType) {
      case "image":
        bodyFormData.append("image", file);
        var url = "/api/admin/image";
        break;

      case "multi-image":
        [...file].forEach((f) => {
          bodyFormData.append("image", f);
        });
        var url = "/api/admin/multi-image";
        break;

      case "pdf":
        bodyFormData.append("doc", file);
        var url = "/api/admin/upload-doc";
        break;

      default:
        break;
    }

    const options = {
      onUploadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent;
        let percent = Math.floor((loaded * 100) / total);
        percentHandler(percent);
        console.log(`${loaded}kb of ${total}kb | ${percent}`);
      },
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token,
      },
    };

    const { data } = await axiosInstance.post(
      url,
      bodyFormData,
      options
    );
    if (data.data.location) {
      console.log("location", data.data.location);
      return data.data.location;
    }
  } catch (err) {
    return { error: getError(err) };
  }
};

