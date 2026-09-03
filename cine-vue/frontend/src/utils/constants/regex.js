export const REGEX = {
    // SỐ ĐIỆN THOẠI
    // Chấp nhận 10-11 số cơ bản
    PHONE_NUMBER: /^[0-9]{10,11}$/,
    // (Tuỳ chọn) Định dạng số điện thoại Việt Nam khắt khe hơn: bắt đầu bằng 03, 05, 07, 08, 09 và có đúng 10 số
    PHONE_VN: /^(0[3|5|7|8|9])[0-9]{8}$/,
    
    // EMAIL
    // Định dạng email chuẩn
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    
    // MẬT KHẨU
    // Mật khẩu cơ bản: Ít nhất 8 ký tự
    PASSWORD_MIN_8: /^.{8,}$/,
    // Mật khẩu mạnh: Ít nhất 8 ký tự, có chữ hoa, chữ thường và số
    PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
    // Mật khẩu cực mạnh: Ít nhất 8 ký tự, có chữ hoa, thường, số và ký tự đặc biệt
    PASSWORD_VERY_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

    // HỌ VÀ TÊN
    // Chấp nhận chữ cái Tiếng Việt và dấu cách, không chứa số hay ký tự đặc biệt
    FULL_NAME: /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/,

    // TÊN ĐĂNG NHẬP (USERNAME)
    // Chỉ chứa chữ, số, dấu gạch dưới, dài từ 3-20 ký tự
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,

    // MÃ XÁC NHẬN (OTP)
    // Chính xác 6 chữ số
    OTP_6_DIGITS: /^[0-9]{6}$/,

    // CĂN CƯỚC CÔNG DÂN (CCCD) / CMND Việt Nam
    // CCCD (12 số) hoặc CMND (9 số)
    ID_CARD_VN: /^([0-9]{9}|[0-9]{12})$/,
};
