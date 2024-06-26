<template>
	<div class="layout-padding">
		<splitpanes>
			<pane size="15">
				<div class="layout-padding-auto layout-padding-view">
					<el-scrollbar>
						<query-tree :placeholder="$t('common.queryDeptTip')" :query="deptData.queryList" :show-expand="true" @node-click="handleNodeClick">
							<!-- 没有数据权限提示 -->
							<template #default="{ node, data }">
								<el-tooltip v-if="data.isLock" class="item" effect="dark" :content="$t('sysuser.noDataScopeTip')" placement="right-start">
									<span
										>{{ node.label }}
										<SvgIcon name="ele-Lock" />
									</span>
								</el-tooltip>
								<span v-if="!data.isLock">{{ node.label }}</span>
							</template>
						</query-tree>
					</el-scrollbar>
				</div>
			</pane>
			<pane class="ml8">
				<div class="layout-padding-auto layout-padding-view">
					<el-row v-show="showSearch">
						<el-form ref="queryRef" :inline="true" :model="state.queryForm" @keyup.enter="getDataList">
							<el-form-item :label="$t('sysuser.ehrNo')" prop="ehrNo">
								<el-input v-model="state.queryForm.ehrNo" :placeholder="$t('sysuser.inputEhrNoTip')" clearable />
							</el-form-item>
							<el-form-item :label="$t('sysuser.username')" prop="name">
								<el-input v-model="state.queryForm.name" :placeholder="$t('sysuser.inputUsernameTip')" clearable />
							</el-form-item>
							<el-form-item>
								<el-button icon="Search" type="primary" @click="getDataList">{{ $t('common.queryBtn') }}</el-button>
								<el-button icon="Refresh" @click="resetQuery">{{ $t('common.resetBtn') }}</el-button>
							</el-form-item>
						</el-form>
					</el-row>
					<el-row>
						<div class="mb8" style="width: 100%">
							<el-button v-auth="'sys_user_add'" icon="folder-add" type="primary" @click="userDialogRef.openDialog()">
								{{ $t('common.addBtn') }}
							</el-button>
							<el-button plain v-auth="'sys_user_add'" class="ml10" icon="upload-filled" type="primary" @click="excelUploadRef.show()">
								{{ $t('common.importBtn') }}
							</el-button>

							<el-button
								plain
								v-auth="'sys_user_del'"
								:disabled="multiple"
								class="ml10"
								icon="Delete"
								type="primary"
								@click="handleDelete(selectObjs)"
							>
								{{ $t('common.delBtn') }}
							</el-button>

							<right-toolbar
								v-model:showSearch="showSearch"
								:export="'sys_user_export'"
								@exportExcel="exportExcel"
								@queryTable="getDataList"
								class="ml10 mr20"
								style="float: right"
							/>
						</div>
					</el-row>
					<el-table
						v-loading="state.loading"
						:data="state.dataList"
						@selection-change="handleSelectionChange"
						border
						:cell-style="tableStyle.cellStyle"
						:header-cell-style="tableStyle.headerCellStyle"
					>
						<el-table-column :selectable="handleSelectable" type="selection" width="40" />
						<!-- <el-table-column :label="$t('sysuser.index')" type="index" width="60" fixed="left" /> -->
						<el-table-column :label="$t('sysuser.ehrNo')" prop="ehrNo" fixed="left" show-overflow-tooltip></el-table-column>
						<el-table-column :label="$t('sysuser.name')" prop="name" show-overflow-tooltip></el-table-column>
						<el-table-column :label="$t('sysuser.dept')" prop="deptName" show-overflow-tooltip></el-table-column>
						<!-- <el-table-column :label="$t('sysuser.ehrStatus')" show-overflow-tooltip>
							<template #default="scope">
								<el-tag v-for="(item, index) in scope.row.postList" :key="index">{{ item.postName }}</el-tag>
							</template>
						</el-table-column> -->
						<el-table-column :label="$t('sysuser.role')" show-overflow-tooltip>
							<template #default="scope">
								<el-tag v-for="(item, index) in scope.row.roleList" :key="index">{{ item.roleCode + '-' + item.roleName }}</el-tag>
							</template>
						</el-table-column>
						<el-table-column :label="$t('sysuser.ehrStatus')" show-overflow-tooltip>
							<template #default="scope">
								<el-switch v-model="scope.row.ehrStatus" @change="changeSwitch(scope.row)" active-value="0" inactive-value="1"></el-switch>
							</template>
						</el-table-column>
						<!-- <el-table-column :label="$t('sysuser.createTime')" prop="createTime" show-overflow-tooltip width="180"></el-table-column> -->
						<el-table-column :label="$t('common.action')" width="160" fixed="right">
							<template #default="scope">
								<el-button v-auth="'sys_user_edit'" icon="edit-pen" text type="primary" @click="userDialogRef.openDialog(scope.row.userId)">
									{{ $t('common.editBtn') }}
								</el-button>
								<el-tooltip :content="$t('sysuser.deleteDisabledTip')" :disabled="scope.row.userId !== '1'" placement="top">
									<span style="margin-left: 12px">
										<el-button
											icon="delete"
											v-auth="'sys_user_del'"
											:disabled="scope.row.username === 'admin'"
											text
											type="primary"
											@click="handleDelete([scope.row.userId])"
											>{{ $t('common.delBtn') }}
										</el-button>
									</span>
								</el-tooltip>
							</template>
						</el-table-column>
					</el-table>
					<pagination v-bind="state.pagination" @current-change="currentChangeHandle" @size-change="sizeChangeHandle"> </pagination>
				</div>
			</pane>
		</splitpanes>

		<user-form ref="userDialogRef" @refresh="getDataList(false)" />

		<upload-excel
			ref="excelUploadRef"
			:title="$t('sysuser.importUserTip')"
			temp-url="/admin/sys-file/local/file/user.xlsx"
			url="/admin/user/import"
			@refreshDataList="getDataList"
		/>
	</div>
</template>

<script lang="ts" name="systemUser" setup>
import { delObj, pageList, putObj } from '/@/api/admin/user';
import { deptTree } from '/@/api/admin/dept';
import { myDeptTree } from '/@/api/my/dept';
import { BasicTableProps, useTable } from '/@/hooks/table';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
import { delUser, userList, updateUser } from '/@/api/my/user';

// 动态引入组件
const UserForm = defineAsyncComponent(() => import('./form.vue'));
const QueryTree = defineAsyncComponent(() => import('/@/components/QueryTree/index.vue'));

const { t } = useI18n();

// 定义变量内容
const userDialogRef = ref();
const excelUploadRef = ref();
const queryRef = ref();
const showSearch = ref(true);

// 多选rows
const selectObjs = ref([]) as any;
// 是否可以多选
const multiple = ref(true);

// 定义表格查询、后台调用的API
const state: BasicTableProps = reactive<BasicTableProps>({
	queryForm: {
		brNo: '',
		name: '',
		ehrNo: ''
	},
	pageList: userList,
});
const { getDataList, currentChangeHandle, sizeChangeHandle, downBlobFile, tableStyle } = useTable(state);

// 部门树使用的数据
const deptData = reactive({
	queryList: (name: String) => {
		return myDeptTree({
			deptName: name,
		});
	},
});

// 清空搜索条件
const resetQuery = () => {
	queryRef.value?.resetFields();
	state.queryForm.brNo = '';
	state.queryForm.ehrNo = '';
	state.queryForm.name = '';
	getDataList();
};

// 点击树
const handleNodeClick = (e: any) => {
	state.queryForm.brNo = e.id;
	getDataList();
};

// 导出excel
const exportExcel = () => {
	downBlobFile('/admin/user/export', state.queryForm, 'users.xlsx');
};

// 是否可以多选
const handleSelectable = (row: any) => {
	return row.username !== 'admin';
};

// 多选事件
const handleSelectionChange = (objs: { userId: string }[]) => {
	selectObjs.value = objs.map(({ userId }) => userId);
	multiple.value = !objs.length;
};

// 删除操作
const handleDelete = async (ids: string[]) => {
	try {
		await useMessageBox().confirm(t('common.delConfirmText'));
	} catch {
		return;
	}

	try {
		await delUser(ids);
		getDataList();
		useMessage().success(t('common.delSuccessText'));
	} catch (err: any) {
		useMessage().error(err.msg);
	}
};

//表格内开关 (用户状态)
const changeSwitch = async (row: object) => {
	await updateUser(row);
	useMessage().success(t('common.optSuccessText'));
	getDataList();
};
</script>
