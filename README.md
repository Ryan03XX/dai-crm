# DAI CRM

Phase 1 MVP：React + Firebase。项目已连接到 Firebase 项目 `dai-crm`。

**New Lead → Follow Up → Qualified → Convert to Company + Contact + Deal → Pipeline → Won / Lost**

## 本地运行

```bash
npm install
npm run dev
```

已启用：Authentication（Email/Password）、Firestore、Storage。

发布安全规则：

```bash
npx firebase deploy --only firestore:rules,storage
```

## 账号说明

- 第一个注册的用户会成为 **Admin**（可看全部客户）
- 之后注册的用户是 **Sales**（只能看自己的客户）
- Admin 可在「用户」页改角色

## 建议的演示路径

1. 注册账号并登录
2. 新建线索
3. 在线索详情记录一次跟进（状态会变成「已跟进」）
4. 把状态改成「已合格」
5. 点击「转化为公司 + 联系人 + 商机」
6. 在销售管道里拖拽卡片，直到赢单或丢单
