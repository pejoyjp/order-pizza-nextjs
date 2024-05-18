import useSWR from 'swr'
import { getUserByUserId } from '@/actions/user';

const useUser = (userId)=>{
    const { data, error, isLoading, mutate } = useSWR(`${userId}`,()=>getUserByUserId(userId));
    return {
        data,error,isLoading,mutate
    }
}
export default useUser