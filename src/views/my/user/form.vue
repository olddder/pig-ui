<template>
	<div class="system-user-dialog-container">
		<el-dialog :close-on-click-modal="false" :title="dataForm.userId ? $t('common.editBtn') : $t('common.addBtn')" draggable v-model="visible">
			<el-form :model="dataForm" :rules="dataRules" label-width="90px" ref="dataFormRef" v-loading="loading">
				<el-row :gutter="20">
					<!-- <el-col :span="12" class="mb20">
						<el-form-item :label="$t('sysuser.username')" prop="username">
							<el-input :disabled="dataForm.userId !== ''" placeholder="请输入用户名" v-model="dataForm.username"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12" class="mb20">
						<el-form-item :label="$t('sysuser.password')" prop="password">
							<el-input clearable placeholder="请输入密码" type="password" v-model="dataForm.password"></el-input>
						</el-form-item>
					</el-col> -->
					<el-col :span="12" class="mb20">
						<el-form-item :label="$t('sysuser.name')" prop="name">
							<el-input clearable placeholder="请输入姓名" v-model="dataForm.name"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12" class="mb20">
						<el-form-item :label="$t('sysuser.ehrNo')" prop="ehrNo">
							<el-input clearable placeholder="请输入员工号" v-model="dataForm.ehrNo"></el-input>
						</el-form-item>
					</el-col>
					<!-- <el-col :span="12" class="mb20">
						<el-form-item :label="$t('sysuser.phone')" prop="phone">
							<el-input clearable placeholder="请输入手机号" v-model="dataForm.phone"></el-input>
						</el-form-item>
					</el-col> -->
					<el-col :span="12" class="mb20">
						<el-form-item :label="$t('sysuser.role')" prop="role">
							<el-select class="w100" clearable multiple placeholder="请选择角色" v-model="dataForm.role">
								<el-option :key="item.roleCode" :label="item.roleCode + '-' + item.roleName" :value="item.roleCode" v-for="item in roleData" />
							</el-select>
						</el-form-item>
					</el-col>
					<!-- <el-col :span="12" class="mb20">
						<el-form-item :label="$t('sysuser.post')" prop="post">
							<el-select class="w100" clearable multiple placeholder="请选择岗位" v-model="dataForm.post">
								<el-option :key="item.postId" :label="item.postName" :value="item.postId" v-for="item in postData" />
							</el-select>
						</el-form-item>
					</el-col> -->
					<el-col :span="12" class="mb20">
						<el-form-item :label="$t('sysuser.dept')" prop="brNo">
							<el-tree-select
								:data="deptData"
								:props="{ value: 'id', label: 'name', children: 'children' }"
								check-strictly
								class="w100"
								clearable
								placeholder="请选择所属部门"
								v-model="dataForm.brNo"
								filterable
							>
							</el-tree-select>
						</el-form-item>
					</el-col>

					<!-- <el-col :span="12" class="mb20">
						<el-form-item :label="$t('sysuser.email')" prop="email">
							<el-input clearable placeholder="请输入邮箱" v-model="dataForm.email"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12" class="mb20">
						<el-form-item :label="$t('sysuser.nickname')" prop="nickname">
							<el-input clearable placeholder="请输入昵称" v-model="dataForm.nickname"></el-input>
						</el-form-item>
					</el-col> -->
					<el-col :span="12" class="mb20">
						<el-form-item :label="$t('sysuser.ehrStatus')" prop="ehrStatus">
							<el-radio-group v-model="dataForm.ehrStatus">
								<el-radio :key="index" :label="item.value" border v-for="(item, index) in ehr_status">{{ item.label }} </el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="visible = false">{{ $t('common.cancelButtonText') }}</el-button>
					<el-button @click="onSubmit" type="primary" :disabled="loading">{{ $t('common.confirmButtonText') }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" name="systemUserDialog" setup>
import { addObj, getObj, putObj, validatePhone, validateUsername } from '/@/api/admin/user';
import { list as roleList } from '/@/api/admin/role';
import { list as postList } from '/@/api/admin/post';
import { deptTree } from '/@/api/admin/dept';
import { myDeptTree } from '/@/api/my/dept';
import { useDict } from '/@/hooks/dict';
import { useI18n } from 'vue-i18n';
import { useMessage } from '/@/hooks/message';
import { rule } from '/@/utils/validate';
import { myGetObj, updateUser, addUser } from '/@/api/my/user';
import { myRoleList } from '/@/api/my/role';

const { t } = useI18n();

// 定义刷新表格emit
const emit = defineEmits(['refresh']);
// @ts-ignore
const { ehr_status } = useDict('ehr_status');

// 定义变量内容
const dataFormRef = ref();
const visible = ref(false);
const deptData = ref<any[]>([]);
const roleData = ref<any[]>([]);
const postData = ref<any[]>([]);
const loading = ref(false);

const dataForm = reactive({
	userId: '',
	id: '',
	username: '',
	ehrNo: '',
	password: '' as String | undefined,
	salt: '',
	wxOpenid: '',
	qqOpenid: '',
	lockFlag: '0',
	phone: '' as String | undefined,
	brNo: '',
	roleList: [],
	postList: [],
	nickname: '',
	name: '',
	email: '',
	post: [] as string[],
	role: [] as string[],
	ehrStatus: '0'
});

const dataRules = ref({
	// 用户名校验，不能为空 、长度 5-20、不能和已有数据重复
	// username: [
	// 	{ required: true, message: '用户名不能为空', trigger: 'blur' },
	// 	{ min: 5, max: 20, message: '用户名称长度必须介于 5 和 20 之间', trigger: 'blur' },
	// 	{
	// 		validator: (rule: any, value: any, callback: any) => {
	// 			validateUsername(rule, value, callback, dataForm.userId !== '');
	// 		},
	// 		trigger: 'blur',
	// 	},
	// ],
	password: [
		{ required: true, message: '密码不能为空', trigger: 'blur' },
		{
			min: 6,
			max: 20,
			message: '用户密码长度必须介于 5 和 20 之间',
			trigger: 'blur',
		},
	],
	// 姓名校验，不能为空、只能是中文
	name: [
		{ required: true, message: '姓名不能为空', trigger: 'blur' },
		{ validator: rule.chinese, trigger: 'blur' },
	],
	ehrNo: [{ required: true, message: '员工号不能为空', trigger: 'blur' }],
	brNo: [{ required: true, message: '部门不能为空', trigger: 'blur' }],
	role: [{ required: true, message: '角色不能为空', trigger: 'blur' }],
	post: [{ required: true, message: '岗位不能为空', trigger: 'blur' }],
	// 手机号校验，不能为空、新增的时不能重复校验
	// phone: [
	// 	{ required: true, message: '手机号不能为空', trigger: 'blur' },
	// 	{ validator: rule.validatePhone, trigger: 'blur' },
	// 	{
	// 		validator: (rule: any, value: any, callback: any) => {
	// 			validatePhone(rule, value, callback, dataForm.userId !== '');
	// 		},
	// 		trigger: 'blur',
	// 	},
	// ],
	email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
	lockFlag: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
});

// 打开弹窗
const openDialog = async (userId: string) => {
	visible.value = true;
	dataForm.userId = '';

	// 重置表单数据
	nextTick(() => {
		dataFormRef.value?.resetFields();
	});

	// 加载使用的数据
	getDeptData();
	getPostData();
	getRoleData();

    // 修改获取用户信息
	if (userId) {
		dataForm.userId = userId;
		await getUserData(userId);
		dataForm.password = '******';
	}
};

// 提交
const onSubmit = async () => {
	const valid = await dataFormRef.value.validate().catch(() => {});
	if (!valid) return false;

	try {
		const { userId, phone, password } = dataForm;

		if (userId) {
			// 清除占位符，避免提交错误的数据
			if (phone?.includes('*')) dataForm.phone = undefined;
			if (password?.includes('******')) dataForm.password = undefined;

			loading.value = true;
			await updateUser(dataForm);
			useMessage().success(t('common.editSuccessText'));
			visible.value = false; // 关闭弹窗
			emit('refresh');
		} else {
			loading.value = true;
			await addUser(dataForm);
			useMessage().success(t('common.addSuccessText'));
			visible.value = false; // 关闭弹窗
			emit('refresh');
		}
	} catch (error: any) {
		useMessage().error(error.msg);
	} finally {
		loading.value = false;
	}
};

/**
 * 从服务器获取用户数据
 *
 * @async
 * @param {string} id - 用户 ID
 * @return {Promise} - 包含用户数据的 Promise 对象
 */
const getUserData = async (userId: string) => {
	try {
		loading.value = true;
		const { data } = await myGetObj(userId);
		Object.assign(dataForm, data);
		if (data.roleList) {
			dataForm.role = data.roleList.map((item: { roleCode: string; }) => item.roleCode);
		}
		if (data.postList) {
			dataForm.post = data.postList.map((item: { postId: any; }) => item.postId);
		}
	} catch (err: any) {
		useMessage().error(err.msg);
	} finally {
		loading.value = false;
	}
};

// 初始化部门数据
const getDeptData = () => {
	// 获取部门数据
	myDeptTree().then((res) => {
		deptData.value = res.data;
		// 默认选择第一个
		// dataForm.brNo = res.data[0].id;
	});
};

// 岗位数据
const getPostData = () => {
	postList().then((res) => {
		postData.value = res.data;
		// 默认选择第一个
		// dataForm.post = [res.data[0].postId];
	});
};
// 角色数据
const getRoleData = () => {
	myRoleList().then((res) => {
		roleData.value = res.data;
		// 默认选择第一个
		// dataForm.role = [res.data[0].roleCode];
	});
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>
