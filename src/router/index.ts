import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/employees',
  },
  {
    path: '/employees',
    name: 'employee-list',
    component: () => import('@/views/EmployeeListView.vue'),
    meta: {
      title: 'Employees',
      breadcrumbs: [{ title: 'Employees' }],
    },
  },
  {
    path: '/employees/:code',
    name: 'employee-profile',
    component: () => import('@/views/EmployeeProfileView.vue'),
    props: true,
    meta: {
      title: 'Employee profile',
      // Profile crumb resolved at render time so it can show the code/name.
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Not found' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const APP_NAME = 'Purple Cross — Employee Management'
router.afterEach((to) => {
  const meta = to.meta as { title?: string } | undefined
  let pageTitle = meta?.title
  if (to.name === 'employee-profile' && to.params.code) {
    pageTitle = `Employee ${String(to.params.code)}`
  }
  document.title = pageTitle ? `${pageTitle} · ${APP_NAME}` : APP_NAME
})

export default router
