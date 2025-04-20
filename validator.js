export function validateStudentId(studentId) {
  const regex = /^[0-9]{1,8}$/;
  return regex.test(studentId);
}