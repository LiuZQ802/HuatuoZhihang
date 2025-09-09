import {createStore} from 'vuex'
import ChatConfigStore from "./modules/ChatConfigStore.ts";
import MultiRoundQAStore from "./modules/MultiRoundQAStore.ts"
import MapQAStore from "./modules/MapQAStore.ts"
import MapConfigStore from "./modules/MapConfigStore.ts"
import RobotStore from "@/store/modules/RobotStore.ts";
import UserProfileStore from "@/store/modules/UserProfileStore.ts";
export default createStore({
    modules: {
        ChatConfigStore,
        MultiRoundQAStore,
        MapQAStore,
        MapConfigStore,
        RobotStore,
        UserProfileStore
    }
})