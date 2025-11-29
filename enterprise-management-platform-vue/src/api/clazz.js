import request from "@/utils/request.js";
//查询班级列表数据
export const queryPageApi = (name, begin, end, page, pageSize) =>
  request.get(
    `/clazzs?name=${name}&begin=${begin}&end=${end}&page=${page}&pageSize=${pageSize}`
  );

//查询全部班级
export const queryAllApi = () => request.get("/clazzs/list");

//新增
export const addApi = (clazz) => request.post("/clazzs", clazz);

//根据ID查询
export const queryByIdApi = (id) => request.get(`clazzs/${id}`);

//修改
export const updateApi = (clazz) => request.put("/clazzs", clazz);

//删除
export const deleteByIdApi = (id) => request.delete(`clazzs/${id}`);
