import api from "../../../../../../FE/admin-fe/src/utils/axios";

export const getAllOrder = async () => {
    return await api.get("/Orders/GetAll");
};
