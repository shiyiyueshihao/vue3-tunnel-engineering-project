// 后端统一返回格式
export interface ResData<T = any> {
    status: number;
    msg: string;
    accessToken?: string; // 只有登录和刷新接口会返回
    username?: string;
    permission?: string;
    data?: T;
}