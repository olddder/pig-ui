import request from '/@/utils/request';

export const myRoleList = (params?: Object) => {
	return request({
		url: '/my/role/list',
		method: 'get',
		params,
	});
};

export const myRolePage = (params?: Object) => {
	return request({
		url: '/my/role/page',
		method: 'get',
		params,
	});
};