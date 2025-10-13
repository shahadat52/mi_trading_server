/* eslint-disable @typescript-eslint/no-explicit-any */
const isExists = async (id: string, model: any) => {
  return await model.findOne(id);
};
export default isExists;
