import { createRouter, createWebHistory } from 'vue-router';
import home from '@/views/home.vue';
import { useAuthStore } from '@/stores/auth';

function uploadAuthGuard(to, from) {
    const auth = useAuthStore();

    if (!auth.user.canUpload) {
        return {name: 'notAuthorized'};
    } else return true;
};

const routes = [
    {path: '/', name: 'home', component: home},
    {path: '/search', name: 'search', component: ()=>import('@/views/search.vue')},
    {path: '/search-results', name: 'searchResults', component: ()=>import('@/views/searchResults.vue')},
    {path: '/login', name: 'login', component: ()=>import('@/views/login.vue')},
    {path: '/login/callback', redirect: '/login'},
    {path: '/upload', name: 'upload', component: ()=>import('@/views/upload.vue'), beforeEnter: [uploadAuthGuard]},
    {path: '/notAuthorized', name: 'notAuthorized', component: ()=>import('@/views/notAuthorized.vue')},
    {path: '/:pathMatch(.*)*', name: 'notFound', component: ()=>import('@/views/notFound.vue')}
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to) => {
    const publicPages = ['/login', '/notAuthorized'];
    const authRequired = !publicPages.includes(to.path);
    const auth = useAuthStore();

    if (authRequired && !auth.user) {
        auth.returnURL = to.fullPath;
        return {name: 'login'};
    } else return true;
});

export default router;