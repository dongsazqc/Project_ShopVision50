import api from "../../../../../../FE/admin-fe/src/utils/axios";

export const deleteOrder = async (id) => {
    return await api.delete(`/Orders/Delete/${id}`);
};
