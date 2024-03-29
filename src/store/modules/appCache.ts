import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import store from '@/store'

import { Loading } from 'element-ui'
import { getApplicationPreferences, getAuthorizableEntities, getDisplayLanguages, getEntities, getEntityDataByQueryString, getFlexApplicationPreferences, getForms, getWorkflows } from '@/api/appCache';

import { Entity } from '@/models/Entity';
import { getRecentItems } from '@/api/data';
import { ItemInstance } from '@/models/ItemInstance';
import { FlexApplicationPreferences } from '@/models/FlexApplicationPreferences';
import { ApplicationPreference } from '@/models/ApplicationPreference';
import { FormsModule } from './FormsStore';
export interface IAppCache {

    Prefrences: ApplicationPreference[]
    FlexSettings: FlexApplicationPreferences
    Entities: Entity[]
    RecentItems: ItemInstance[]

    AuthorizableEntities: []
}


@Module({ dynamic: true, store, name: 'appCache' })
class AppCacheMod extends VuexModule implements IAppCache {
    public Prefrences: ApplicationPreference[] = [];
    public FlexSettings: FlexApplicationPreferences = {};
    public Entities: Entity[] = [];
    public RecentItems: ItemInstance[] = [];

    public AuthorizableEntities = []

    @Mutation
    private SET_DATA(pref: ApplicationPreference[] | any[]) {
        // const pref = AppDataModule.getApiData(ApiEndpoints.APPLICATIONPREFERENCES)
        this.Prefrences = pref;
    }
    @Mutation
    private SET_FLEX_SETTINGS(data: FlexApplicationPreferences) {
        this.FlexSettings = data;
    }
    @Mutation
    private SET_ENTITIES(data: any[]) {
        this.Entities = data;
    }


    @Mutation
    private CHANGE_SETTING(payload: { key: string, value: any }) {
        const { key, value } = payload
        if (Object.prototype.hasOwnProperty.call(this, key)) {
            (this as any)[key] = value
        }
    }

    @Action
    public ChangeSetting(payload: { key: string, value: any }) {
        this.CHANGE_SETTING(payload)
    }

    @Action
    public async getPrefrences() {
        const rs = await getApplicationPreferences();

        this.SET_DATA(rs)
    }

    @Action
    public async getFlexSettings() {
        const rs = await getFlexApplicationPreferences();
        this.SET_FLEX_SETTINGS(rs)
    }

    @Action
    public async getEntities() {
        const rs = await getEntities();
        this.SET_ENTITIES(rs)
    }

    @Mutation
    private SET_RECENT(rs: ItemInstance[]) {

        this.RecentItems = rs;
    }
    @Action
    public async getRecentItems() {
        const rs = await getRecentItems(10);
        this.SET_RECENT(rs)
    }



    @Mutation
    private SET_AUTH_ENTITIES(rs: any) {
        this.AuthorizableEntities = rs;
    }
    @Action
    public async getAuthorizableEntities() {
        const rs = await getAuthorizableEntities();
        this.SET_AUTH_ENTITIES(rs)
    }

    @Action
    public async getFormsCache() {
        const rs = await FormsModule.getForms();
    }


    @Action
    public async getCache() {
        let indicator = Loading.service({
            lock: true,
            text: 'Loading Application Cache...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
        })
        await this.getFlexSettings();
        await this.getPrefrences();
        await this.getEntities()
        await this.getFormsCache();
        await this.getRecentItems();
        await this.getAuthorizableEntities();

        indicator.close()


    }

    @Action
    public async getDisplayLanguages() {
        const rs = await getDisplayLanguages()

        return rs.displayLanguages;
    }

    @Action
    public async getWorkflows() {
        const rs = await getWorkflows();
        return rs;
    }

    @Action
    public async getEntityByQueryString(entityId: string, queryString: string, pageSize: number) {

        const rs = await getEntityDataByQueryString(entityId);
        return rs;
    }
}

export const AppCacheModule = getModule(AppCacheMod)
