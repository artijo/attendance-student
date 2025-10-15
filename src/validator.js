export function validateStudentId(studentId) {
  const regex = /^[0-9]{1,8}$/;
  return regex.test(studentId);
}

import * as yup from "yup";

/**
 * Helper function to validate data with Yup schema
 * @param {yup.ObjectSchema} schema - Yup validation schema
 * @param {Object} data - Data to validate
 * @returns {Object} - { success: boolean, value?: Object, errors?: Object }
 */
function validateWithSchema(schema, data) {
  try {
    const result = schema.validateSync(data, { abortEarly: false });
    return { success: true, value: result };
  } catch (error) {
    const formattedErrors = {};
    if (error.inner && Array.isArray(error.inner)) {
      error.inner.forEach((err) => {
        formattedErrors[err.path] = err.message;
      });
    }
    return { success: false, errors: formattedErrors };
  }
}

/**
 * Validation schema for leave request form
 */
export const leaveRequestSchema = yup.object().shape({
  leaveTypeId: yup.string().required("กรุณาเลือกประเภทการลา"),

  leaveDate: yup
    .string()
    .required("กรุณาเลือกวันที่ลา")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง"),

  leaveReason: yup
    .string()
    .required("กรุณากรอกเหตุผลในการลา")
    .trim()
    .min(10, "เหตุผลในการลาต้องมีอย่างน้อย 10 ตัวอักษร")
    .max(500, "เหตุผลในการลาต้องไม่เกิน 500 ตัวอักษร"),

  tel: yup
    .string()
    .required("กรุณากรอกเบอร์โทรศัพท์")
    .trim()
    .matches(/^[0-9]{10}$/, "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก"),

  selectedStudyTimes: yup
    .array()
    .min(1, "กรุณาเลือกอย่างน้อยหนึ่งคาบเรียนที่ต้องการลา")
    .required("กรุณาเลือกคาบเรียนที่ต้องการลา"),

  leaveFile: yup
    .mixed()
    .nullable()
    .test("fileSize", "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)", (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    })
    .test("fileType", "รองรับเฉพาะไฟล์ PDF, JPG, PNG เท่านั้น", (value) => {
      if (!value) return true;
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      return allowedTypes.includes(value.type);
    }),
});

/**
 * Validate leave request form data
 * @param {Object} data - Leave request form data
 * @returns {Object} - { success: boolean, value?: Object, errors?: Object }
 */
export function validateLeaveRequest(data) {
  return validateWithSchema(leaveRequestSchema, data);
}
