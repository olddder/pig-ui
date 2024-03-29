import request from '/@/utils/request';

export const userList = (params?: Object) => {
	return request({
		url: '/my/user/list',
		method: 'get',
		params,
	});
};

export const updateUser = (obj: Object) => {
	return request({
		url: '/my/user',
		method: 'put',
		data: obj,
	});
};

export const myGetObj = (id: String) => {
	return request({
		url: '/my/user/details/' + id,
		method: 'get',
	});
};