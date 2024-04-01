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

export const getRole = (id: string) => {
	return request({
		url: '/my/role/details/' + id,
		method: 'get',
	});
};

export const updateRole = (obj: Object) => {
	return request({
		url: '/my/role',
		method: 'put',
		data: obj,
	});
};

export const addRole = (obj: Object) => {
	return request({
		url: '/my/role',
		method: 'post',
		data: obj,
	});
};

export const delRole = (ids: Object) => {
	return request({
		url: '/my/role',
		method: 'delete',
		data: ids,
	});
};