import request from '/@/utils/request';

export const myDeptTree = (params?: Object) => {
	return request({
		url: '/my/dept/tree',
		method: 'get',
		params,
	});
};