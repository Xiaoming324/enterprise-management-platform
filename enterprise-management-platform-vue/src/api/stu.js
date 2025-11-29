import request from "@/utils/request.js";
//查询学员列表数据
export const queryPageApi = (name, degree, clazzId, page, pageSize) =>
  request.get(
    `/students?name=${name}&degree=${degree}&clazzId=${clazzId}&page=${page}&pageSize=${pageSize}`
  );

//违纪处理
export const punishApi = (id, score) => request.put(`/students/violation/${id}/${score}`);

//新增
export const addApi = (stu) => request.post('/students', stu);

//根据ID查询
export const queryByIdApi = (id) => request.get(`students/${id}`);

//修改
export const updateApi = (stu) => request.put("/students", stu);

//删除
export const deleteByIdsApi = (ids) => request.delete(`/students/${ids}`);