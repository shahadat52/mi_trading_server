/* eslint-disable @typescript-eslint/no-explicit-any */
const isExists = async (id: string, model: any) => {
  console.log({model});
  return await model.findOne(id);
};
export default isExists;
