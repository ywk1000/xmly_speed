#!/usr/bin/env bash

## Build 20220118-001-test

## 导入通用变量与函数
dir_shell=/ql/shell
. $dir_shell/share.sh
. $dir_shell/api.sh

## 版本号判断
function version_gt() { test "$(echo "$@" | tr " " "\n" | sort -V | head -n 1)" != "$1"; }
function version_le() { test "$(echo "$@" | tr " " "\n" | sort -V | head -n 1)" == "$1"; }
function version_lt() { test "$(echo "$@" | tr " " "\n" | sort -rV | head -n 1)" != "$1"; }
function version_ge() { test "$(echo "$@" | tr " " "\n" | sort -rV | head -n 1)" == "$1"; }
cur_version="$(curl -s --noproxy "*" "http://0.0.0.0:5600/api/system"|jq -r .data|jq -r .version)"

# 定义 json 数据查询工具
def_envs_tool(){
    for i in $@; do
        curl -s --noproxy "*" "http://0.0.0.0:5600/api/envs?searchValue=$i" -H "Authorization: Bearer $token" | jq .data | perl -pe "{s|^\[\|\]$||g; s|\n||g; s|\},$|\}\n|g}"
    done
}

def_json_total(){
    def_envs_tool $1 | jq -r .$2
}

def_json(){
    def_envs_tool $1 | grep "$3" | jq -r .$2
}

def_json_match(){
    cat "$1" | perl -pe '{s|^\[\|\]$||g; s|\n||g; s|\},$|\}\n|g}' | grep "$2" | jq -r .$3
}

def_json_value(){
    cat "$1" | perl -pe "{s|^\[\|\]$||g; s|\n||g; s|\},$|\}\n|g}" | grep "$3" | jq -r .$2
}

def_sub(){
    local i j
    for i in $(def_json_total $1 $2 | awk '/'$3'/{print NR}'); do
        j=$((i - 1));
        echo $j
    done
}

def_sub_value(){
    local line=$(($3 + 1))
    def_json_total $1 $2 | awk 'NR=='$line''
}

## 生成pt_pin清单
gen_pt_pin_array() {
    ## 生成 json 值清单
    gen_basic_value(){
        for i in $@; do
            eval $i='($(def_json_total JD_COOKIE $i | perl -pe "{s| ||g}"))'
        done
    }

    #if version_lt $cur_version 2.11.0; then
    #   tmp_id="_id"
    #else
    #   tmp_id="id"
    #fi

    tmp_id="id"
    [[ $(def_json_total JD_COOKIE $tmp_id) =~ null ]] && tmp_id="_id"

    gen_basic_value value $tmp_id
    ori_sub=(${!value[@]})
    ori_sn=($(def_json JD_COOKIE value | awk '{print NR}'))
    pin=($(def_json_total JD_COOKIE value | perl -pe "{s|.*pt_pin=([^; ]+)(?=;?).*|\1|}"))
    pt_pin=($(def_json_total JD_COOKIE value | perl -pe "{s|.*pt_pin=([^; ]+)(?=;?).*|\1|}" | awk 'BEGIN{for(i=0;i<10;i++)hex[i]=i;hex["A"]=hex["a"]=10;hex["B"]=hex["b"]=11;hex["C"]=hex["c"]=12;hex["D"]=hex["d"]=13;hex["E"]=hex["e"]=14;hex["F"]=hex["f"]=15;}{gsub(/\+/," ");i=$0;while(match(i,/%../)){;if(RSTART>1);printf"%s",substr(i,1,RSTART-1);printf"%c",hex[substr(i,RSTART+1,1)]*16+hex[substr(i,RSTART+2,1)];i=substr(i,RSTART+RLENGTH);}print i;}'))
    ori_valid_pin=($(def_envs_tool JD_COOKIE | grep '"status": 0' | perl -pe "{s|.*pt_pin=([^; ]+)(?=;?).*|\1|}"))
    ori_invalid_pin=($(def_envs_tool JD_COOKIE | grep '"status": 1' | perl -pe "{s|.*pt_pin=([^; ]+)(?=;?).*|\1|}"))
}

#青龙启用/禁用环境变量API
ql_process_env_api() {
    local currentTimeStamp=$(date +%s)
    local id=$1
    local ck_status=$2
    [[ $2 = 0 ]] && process=enable
    [[ $2 = 1 ]] && process=disable
    local url="http://0.0.0.0:5600/api/envs/$process"

    local api=$(
        curl -s --noproxy "*" "$url?t=$currentTimeStamp" \
            -X 'PUT' \
            -H "Accept: application/json" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json;charset=UTF-8" \
            --data-raw "[\"$id\"]"
    )

    code=$(echo $api | jq -r .code)
    message=$(echo $api | jq -r .message)
    if [[ $code == 200 ]]; then
        if [[ $ck_status = 0 ]]; then
            echo -e "已重启"
        elif [[ $ck_status = 1 ]]; then
            echo -e "已禁用"
        fi
    else
        if [[ $ck_status = 0 ]]; then
            echo -e "已启用失败(${message})"
        elif [[ $ck_status = 1 ]]; then
            echo -e "已禁用失败(${message})"
        fi
    fi
}

#青龙更新环境变量API
ql_update_env_api() {
    local currentTimeStamp=$(date +%s)
    local name=$1
    local value=$2
    local id=$3
    local remarks=$4
    local url="http://0.0.0.0:5600/api/envs"

    local api=$(
        curl -s --noproxy "*" "$url?t=$currentTimeStamp" \
            -X 'PUT' \
            -H "Accept: application/json" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json;charset=UTF-8" \
            --data-raw "{\"name\":\"$name\",\"value\":\"$value\",\"$tmp_id\":\"$id\",\"remarks\":\"$remarks\"}"
    )
    code=$(echo $api | jq -r .code)
    message=$(echo $api | jq -r .message)
    if [[ $code == 200 ]]; then
        echo -e "$name -> 更新成功"
    else
        echo -e "$name -> 更新失败(${message})"
    fi
}

## WxPusher 通知 API
WxPusher_notify_api() {
    local appToken=$1
    local content=$2
    local summary=$3
    local uids=$4
    local url="http://wxpusher.zjiecode.com/api/send/message"

    local api=$(
        curl -s --noproxy "*" "$url" \
            -X 'POST' \
            -H "Content-Type: application/json" \
            --data-raw "{\"appToken\":\"$appToken\",\"content\":\"$content\",\"summary\":\"$summary\",\"contentType\":\"2\",\"uids\":[$uids]}"
    )
}

## 获取用户昵称 API
Get_NickName() {
    local currentTimeStamp=$(date +%s)
    local cookie=$1
    local url_1="https://me-api.jd.com/user_new/info/GetJDUserInfoUnion"
    local url_2="https://wxapp.m.jd.com/kwxhome/myJd/home.json?&useGuideModule=0&bizId=&brandId=&fromType=wxapp&timestamp=$currentTimeStamp"
    local UA_1="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 Edg/96.0.1054.62"
    local UA_2="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.10(0x18000a2a) NetType/WIFI Language/zh_CN"

    local api_1=$(
        curl -s --connect-timeout 20 --retry 3 --noproxy "*" "$url_1" \
            -H "Host: me-api.jd.com" \
            -H "Accept: */*" \
            -H "Connection: keep-alive" \
            -H "Cookie: $cookie" \
            -H "User-Agent: $UA_1" \
            -H "Accept-Language: zh-cn" \
            -H "Referer: https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&" \
            -H "Accept-Encoding:  deflate, br"
    )

    local api_2=$(
        curl -s --connect-timeout 20 --retry 3 --noproxy "*" "$url_2" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -H "Host: wxapp.m.jd.com" \
            -H "Connection: keep-alive" \
            -H "Cookie: $cookie" \
            -H "User-Agent: $UA_2" \
            -H "Referer: https://servicewechat.com/wxa5bf5ee667d91626/161/page-frame.html" \
            -H "Accept-Encoding:  compress,deflate, br"
    )

    retcode=$(echo $api_1 | jq -r .retcode)
    if [[ $retcode == 0 ]]; then
        nickname="$(echo $api_1 | jq -r .data | jq -r .userInfo | jq -r .baseInfo | jq -r .nickname)"
        echo -e "$nickname"
    else
        code=$(echo $api_2 | jq -r .code)
        if [[ $code != 999 ]]; then
            nickname="$(echo $api_2 | jq -r .user | jq -r .petName)"
            echo -e "$nickname"
        fi
    fi
}

## 获取用户状态 API
Get_CK_Status() {
    local cookie=$1
    local url="https://me-api.jd.com/user_new/info/GetJDUserInfoUnion"

    local api=$(
        curl -s --connect-timeout 30 --retry 3 --noproxy "*" "$url" \
            -H "Cookie: $cookie" \
            -H "Referer: https://home.m.jd.com/myJd/home.action"
    )

    local retcode=$(echo $api | jq -r .retcode)
    if [[ "$retcode" == 0 ]]; then
        return 0
    else
        local retcode=$(echo $api | jq -r .retcode)
        if [[ "$retcode" == 0 ]]; then
            return 0
        elif [[ ! "$retcode" || "$retcode" = "null" ]]; then
            return 2
        else
            return 1
        fi
    fi
}

## 打印账号信息
export_uesr_info(){
for i in $@; do
    for j in "${!value[@]}"; do
        [[ ${value[j]} == *$i* ]] && echo ${ori_uesr_info[j]}
    done
done
}

# Cookie 有效性检查
check_jd_ck(){
    local test_jd_cookie="$(curl -s --connect-timeout 20 --retry 3 --noproxy "*" "https://bean.m.jd.com/bean/signIndex.action" -H "cookie: $1")"
    [[ "$test_jd_cookie" ]] && return 0 || return 1
}

# JSON 字符串特殊符号处理
spc_sym_tr(){
    #echo $1 | perl -pe '{s|(\"\|'\''\|\[\|\]\|{\|}\|\\\|\/\|`)|'\\'\\1|g}'
    echo $1 | perl -pe '{s|(\")|'\\'\\1|g}'
}

# 批量检查 Cookie 有效性
verify_ck(){
    gen_pt_pin_array
    for ((x = 1; x <=22; x++)); do eval tmp$x=""; done
    for ((y = 1; y <=2; y++)); do eval tmp_Uid_$y=""; done
    for i in ${!value[@]}; do
        remarks[i]="$(def_json JD_COOKIE remarks "pin=${pin[i]};" | head -1)"
        status[i]="$(def_json JD_COOKIE status "pin=${pin[i]};" | head -1)"
        [[ ${status[i]} = 0 ]] && current_status[i]="已启用" || current_status[i]="已禁用"

        # wskey 相关值
        wskey_value[i]="$(def_json JD_WSCK value "pin=${pin[i]};" | head -1)"
        wskey_id[i]="$(def_json JD_WSCK $tmp_id "pin=${pin[i]};" | head -1)"
        wskey_remarks[i]="$(def_json JD_WSCK remarks "pin=${pin[i]};" | head -1)"

        # WxPusherUid 相关值
        tmp_Uid_1="$(echo ${remarks[i]} | grep -Eo 'UID_\w{28}')"
        CK_WxPusherUid_dir="$dir_scripts"
        [[ $CK_WxPusherUid = 2 ]] && CK_WxPusherUid_file="CK_WxPusherUid_Sample.json" || CK_WxPusherUid_file="CK_WxPusherUid.json"
        [[ -f $CK_WxPusherUid_dir/$CK_WxPusherUid_file ]] && tmp_Uid_2="$(def_json_value "$CK_WxPusherUid_dir/$CK_WxPusherUid_file" Uid "pin=${pin[i]};")"
        if [[ $tmp_Uid_1 ]]; then
            Uid[i]="$tmp_Uid_1"
        elif [[ $tmp_Uid_2 ]]; then
            Uid[i]="$tmp_Uid_2"
        else
            Uid[i]=""
        fi

        # 备注名处理
        remarks_id[i]="$(echo ${remarks[i]} | awk -F '@@' '{print $1}')"
        [[ ! ${remarks_id[i]} || ${remarks_id[i]} = null ]] && [[ ${wskey_remarks[i]} && ${wskey_remarks[i]} != null ]] && remarks_id[i]="${wskey_remarks[i]}"
        if [[ ${remarks[i]} == *@@* ]]; then
            remarks_name[i]="($(echo ${remarks[i]} | awk -F '@@' '{print $1}'))"
        elif [[ ${remarks[i]} && ${remarks[i]} != null ]]; then
            remarks_name[i]="(${remarks[i]})"
        else
            remarks_name[i]="(未备注)"
        fi
        tmp_NickName_1[i]=$(Get_NickName "${value[i]}")
        [[ -f $CK_WxPusherUid_dir/$CK_WxPusherUid_file ]] && tmp_NickName_2[i]="$(def_json_value "$CK_WxPusherUid_dir/$CK_WxPusherUid_file" NickName "pin=${pin[i]};")"
        if [[ ${tmp_NickName_1[i]} ]]; then
            NickName[i]="${tmp_NickName_1[i]}"
        elif [[ ${tmp_NickName_2[i]} && ${tmp_NickName_2[i]} != null ]]; then
            NickName[i]="${tmp_NickName_2[i]}"
        else
            NickName[i]=""
        fi
        [[ ! ${NickName[i]} || ${NickName[i]} = null ]] && UserName[i]=${pt_pin[i]} || UserName[i]=${NickName[i]}
        ori_full_name[i]="【${ori_sn[i]}】${UserName[i]}${remarks_name[i]}"
        full_name[i]="${ori_full_name[i]}"

        if [[ $NICKNAME_REMARK_SYNC = 1 ]]; then
            if [[ ! "${remarks[i]}" =~ "${NickName[i]}" ]]; then
                remarks_ori_id[i]="$(echo ${remarks_id[i]} | awk -F '(' '{print $1}')"
                if [[ ! ${NickName[i]} || ${NickName[i]} = null ]]; then
                    remarks_id[i]="${remarks_ori_id[i]}(${pt_pin[i]})"
                else
                    remarks_id[i]="${remarks_ori_id[i]}(${NickName[i]})"
                fi
            fi
        fi
        remarks_new[i]="${remarks_id[i]}"


        # JD_COOKIE 有效性检查
        echo ""
        Get_CK_Status ${value[i]}
        if [[ $? = 0 ]]; then
            ck_status[i]="0"
            if [[ ${ck_status[i]} = ${status[i]} ]]; then
                ck_status_chinese[i]="正常"
            else
                ck_status_chinese[i]="正常"
                tmp1="${full_name[i]}\n"
                tmp2="$tmp2$tmp1"
            fi
            tmp3="${full_name[i]}\n"
            tmp4="$tmp4$tmp3"
            tmp5="${pin[i]},"
            tmp6="$tmp6$tmp5"
            echo -n "${full_name[i]} ${ck_status_chinese[i]}"
            [[ ${ck_status[i]} != ${status[i]} ]] && echo -e "并$(ql_process_env_api $(eval echo \${$tmp_id[i]}) ${ck_status[i]})" || echo -e ""
        elif [[ $? = 1 ]]; then
            ck_status[i]="1"
            if [[ ${ck_status[i]} = ${status[i]} ]]; then
                ck_status_chinese[i]="失效"
            else
                ck_status_chinese[i]="失效"
                tmp7="${full_name[i]}\n"
                tmp8="$tmp8$tmp7"
            fi
            tmp9="${full_name[i]}\n"
            tmp10="$tmp10$tmp9"
            tmp11="${pin[i]},"
            tmp12="$tmp12$tmp11"
            echo -n "${full_name[i]} ${ck_status_chinese[i]}"
            [[ ${ck_status[i]} != ${status[i]} ]] && echo -e "并$(ql_process_env_api $(eval echo \${$tmp_id[i]}) ${ck_status[i]})" || echo -e ""
        elif [[ $? = 2 ]]; then
            echo -e "${full_name[i]} 因 API 连接失败跳过检测"
        fi

        # JD_WSCK(wskey) 录入情况检查
        if [[ $NOTIFY_WSKEY_NO_EXIST = 1 || $NOTIFY_WSKEY_NO_EXIST = 2 ]]; then
            if [[ ! ${wskey_value[i]} || ${wskey_value[i]} = null ]]; then
                echo -e "${full_name[i]} 未录入JD_WSCK(wskey)"
                tmp13="${full_name[i]}\n"
                tmp14="$tmp14$tmp13"
                none_wskey_pin[i]="${pin[i]}"
            fi
            [[ $NOTIFY_WSKEY_NO_EXIST = 1 ]] && [[ $tmp14 ]] && temp_no_wsck="未录入 JD_WSCK(wskey) 的账号：\n$tmp14\n" || temp_no_wsck=""
        fi

        # 账号剩余有效期检查
        if [[ ${ck_status_chinese[i]} = "正常" ]]; then
            timestamp[i]="$(def_json JD_COOKIE timestamp "pin=${pin[i]};" | head -1)"
            sys_timestamp[i]=$(date -d "${timestamp[i]}" +%s)
            local cur_sys_timestamp=`date '+%s'`
            local total_validity_period=$((30*24*3600))
            local remain_validity_period=$((total_validity_period-cur_sys_timestamp+sys_timestamp[i]))
            if [[ $remain_validity_period -ge 86400 ]]; then
                local valid_time="$((remain_validity_period/86400))天"
            else
                tmp15="${full_name[i]}\n"
                tmp16="$tmp16$tmp15"
                if [[ $remain_validity_period -ge 3600 ]]; then
                    local valid_time="$((remain_validity_period/3600))小时"
                elif [[ $remain_validity_period -ge 60 ]]; then
                    local valid_time="$((remain_validity_period/60))分钟"
                elif [[ $remain_validity_period -ge 1 ]]; then
                    local valid_time="$remain_validity_period秒"
                fi
            fi
            [[ $tmp16 ]] && temp_lt_1day="有效期不足 1 天的账号：\n$tmp16\n" || temp_lt_1day=""
            if [[ $NOTIFY_VALID_TIME = 1 || $NOTIFY_VALID_TIME = 2 ]]; then
                echo -e "${full_name[i]} 剩余有效期$valid_time"
                tmp17="${full_name[i]} 剩余有效期$valid_time\n"
                tmp18="$tmp18$tmp17"
            fi
            [[ $NOTIFY_VALID_TIME = 1 ]] && [[ $tmp18 ]] && temp_valid_time="预测账号有效期：\n$tmp18\n" || temp_valid_time=""
        fi

        # 生成 CK_WxPusherUid.json 或 CK_WxPusherUid_Sample.json 模板
        if [[ ${remarks[i]} == *@@* ]]; then
            timestamp_s[i]="$(echo ${remarks[i]} | grep -Eo '@@([0-9]{13})' | grep -Eo '[0-9]{13}' | head -1)"
            if [[ ${timestamp_s[i]} ]]; then
                if [[ ${Uid[i]} ]]; then
                    remarks_new[i]="${remarks_id[i]}@@${timestamp_s[i]}@@${Uid[i]}"
                else
                    tmp19="${full_name[i]}\n"
                    tmp20="$tmp20$tmp19"
                fi
            else
                timestamp_s[i]=$(echo $[$(date +%s%N)/1000000])
                if [[ ${Uid[i]} ]]; then
                    remarks_new[i]="${remarks_id[i]}@@${timestamp_s[i]}@@${Uid[i]}"
                    ql_update_env_api JD_COOKIE "${value[i]}" $(eval echo \${$tmp_id[i]}) "${remarks_new[i]}"
                fi
            fi
        fi
        if [[ ! ${Uid[i]} ]]; then
            tmp21="${full_name[i]}\n"
            tmp22="$tmp22$tmp21"
        fi
        if [[ $CK_WxPusherUid = 1 || $CK_WxPusherUid = 2 ]]; then
            [[ $tmp20 ]] && temp_No_UID_1="只扫码未对接WxPusher的账号：\n$tmp20\n"
            [[ $tmp22 ]] && temp_No_UID_2="未录入WxPusherUID的账号：\n$tmp22\n"
            NickName_Json[i]="$(spc_sym_tr ${NickName[i]})"
            remarks_id_Json[i]="$(spc_sym_tr ${remarks_id[i]})"
            tmp23=" {\n\t\"序号\": \"${ori_sn[i]}\",\n\t\"NickName\": \"${NickName_Json[i]}\",\n\t\"JD_COOKIE\": \"${value[i]}\",\n\t\"pin\": \"${pin[i]}\",\n\t\"备注\": \"${remarks_id_Json[i]}\",\n\t\"pt_pin\": \"${pt_pin[i]}\",\n\t\"Uid\": \"${Uid[i]}\"\n }"
            tmp24="$tmp24,\n$tmp23"
            [[ $tmp24 ]] && temp_CK_WxPusherUid="[\n$(echo $tmp24 | sed 's/^,\\n//')\n]"
        fi

        # 同步 JD_COOKIE 和 JD_WSCK 的同 pin 备注名
        if [[ $NICKNAME_REMARK_SYNC = 1 ]]; then
            if [[ ! "${remarks[i]}" =~ "${NickName[i]}" ]]; then
                ql_update_env_api JD_COOKIE "${value[i]}" $(eval echo \${$tmp_id[i]}) "${remarks_new[i]}"
            fi
        fi
        if [[ $WSKEY_REMARK_SYNC = 1 ]]; then
            if [[ ${wskey_value[i]} && ${wskey_value[i]} != null ]]; then
                if [[ ${remarks_id[i]} != ${wskey_remarks[i]} ]]; then
                    if [[ ${remarks_id[i]} && ${remarks_id[i]} != null ]]; then
                        ql_update_env_api JD_WSCK "${wskey_value[i]}" ${wskey_id[i]} "${remarks_id[i]}"
                    elif [[ ! ${remarks_id[i]} || ${remarks_id[i]} = null ]]; then
                        ql_update_env_api JD_COOKIE "${value[i]}" $(eval echo \${$tmp_id[i]}) "${remarks_new[i]}"
                    fi
                fi
            fi
        fi
    done
    echo ""
}

#通知内容控制
sort_notify_content(){
    temp_content1(){
        if [[ "$invalid_sub" ]]; then
            echo -n '失效账号：\n'
            for i in $invalid_sub; do
                echo -n "${full_name[i]}"
                [[ ${status[i]} = 0 ]] && echo -n "(本次禁用)\n" || echo -n "\n"
            done
            echo -n "\n"
        fi
    }

    temp_content2(){
        if [[ "$valid_sub" ]]; then
            echo -n '有效账号：\n'
            for i in $valid_sub; do
                echo -n "${full_name[i]}"
                [[ ${status[i]} = 1 ]] && echo -n "(本次启用)\n" || echo -n "\n"
            done
            echo -n "\n"
        fi
    }

    ## 失效账号一对一通知
    notify_one_to_one(){
        if [[ $(echo $WP_APP_TOKEN_ONE|grep -Eo 'AT_(\w{32})') ]]; then
            for i in $invalid_sub; do
                if [[ ${none_wskey_pin[i]} ]]; then
                    local summary_1="Cookie 禁用通知<br><br>${full_name[i]} 账号失效并禁用，未录入 JD_WSCK(wskey)"
                    local content_1="Cookie 禁用通知<br><br>${full_name[i]} 账号失效并禁用，未录入 JD_WSCK(wskey)<br><br><br>$ExNotify_Content"
                else
                    if [[ ! ${status[i]} ]]; then
                        ori_sn[i]="$(($i + 1))"
                        value[i]="$(def_sub_value JD_COOKIE value $i)"
                        pin[i]="$(def_sub_value JD_COOKIE value $i | perl -pe "{s|.*pt_pin=([^; ]+)(?=;?).*|\1|}")"
                        pt_pin[i]="$(def_sub_value JD_COOKIE value $i | perl -pe "{s|.*pt_pin=([^; ]+)(?=;?).*|\1|}" | awk 'BEGIN{for(i=0;i<10;i++)hex[i]=i;hex["A"]=hex["a"]=10;hex["B"]=hex["b"]=11;hex["C"]=hex["c"]=12;hex["D"]=hex["d"]=13;hex["E"]=hex["e"]=14;hex["F"]=hex["f"]=15;}{gsub(/\+/," ");i=$0;while(match(i,/%../)){;if(RSTART>1);printf"%s",substr(i,1,RSTART-1);printf"%c",hex[substr(i,RSTART+1,1)]*16+hex[substr(i,RSTART+2,1)];i=substr(i,RSTART+RLENGTH);}print i;}')"
                        tmp_NickName_1[i]=$(Get_NickName "${value[i]}")
                        [[ -f $CK_WxPusherUid_dir/$CK_WxPusherUid_file ]] && tmp_NickName_2[i]="$(def_json_value "$CK_WxPusherUid_dir/$CK_WxPusherUid_file" NickName "pin=${pin[i]};")"
                        if [[ ${tmp_NickName_1[i]} ]]; then
                            NickName[i]="${tmp_NickName_1[i]}"
                        elif [[ ${tmp_NickName_2[i]} && ${tmp_NickName_2[i]} != null ]]; then
                            NickName[i]="${tmp_NickName_2[i]}"
                        else
                            NickName[i]=""
                        fi
                        [[ ! ${NickName[i]} || ${NickName[i]} = null ]] && UserName[i]=${pt_pin[i]} || UserName[i]=${NickName[i]}
                        ori_full_name[i]="【${ori_sn[i]}】${UserName[i]}${remarks_name[i]}"
                        full_name[i]="${ori_full_name[i]}"
                    fi
                    local summary_1="Cookie 禁用通知<br><br>${full_name[i]} 账号失效并禁用"
                    local content_1="Cookie 禁用通知<br><br>${full_name[i]} 账号失效并禁用<br><br><br>$ExNotify_Content"
                fi
                if [[ $(echo $MainWP_UID|grep -Eo 'UID_\w{28}') ]] && [[ ${Uid[i]} ]]; then
                    local uids_1="$(echo $MainWP_UID,${Uid[i]} | perl -pe '{s|^|\"|; s|,|\",\"|g; s|$|\"|}')"
                elif [[ ! $(echo $MainWP_UID|grep -Eo 'UID_\w{28}') ]] && [[ ${Uid[i]} ]]; then
                    local uids_1="$(echo ${Uid[i]} | perl -pe '{s|^|\"|; s|$|\"|}')"
                elif [[ $(echo $MainWP_UID|grep -Eo 'UID_\w{28}') ]] && [[ ! ${Uid[i]} ]]; then
                    local uids_1="$(echo $MainWP_UID | perl -pe '{s|^|\"|; s|$|\"|}')"
                fi
                if [ "$uids_1" ]; then
                    if [[ $NOTIFY_SKIP_SAME_CONTENT = 1 ]]; then
                        [[ ${status[i]} = 0 ]] && WxPusher_notify_api $WP_APP_TOKEN_ONE "$content_1" "$summary_1" "$uids_1"
                    else
                        WxPusher_notify_api $WP_APP_TOKEN_ONE "$content_1" "$summary_1" "$uids_1"
                    fi
                fi
            done
            for i in $valid_sub; do
                if [[ ${none_wskey_pin[i]} ]]; then
                    local summary_2="Cookie 启用通知<br><br>${full_name[i]} 账号生效并启用，未录入 JD_WSCK(wskey)"
                    local content_2="Cookie 启用通知<br><br>${full_name[i]} 账号生效并启用，未录入 JD_WSCK(wskey)<br><br><br>$ExNotify_Content"
                else
                    local summary_2="Cookie 启用通知<br><br>${full_name[i]} 账号生效并启用"
                    local content_2="Cookie 启用通知<br><br>${full_name[i]} 账号生效并启用<br><br><br>$ExNotify_Content"
                fi
                if [[ $(echo $MainWP_UID|grep -Eo 'UID_\w{28}') ]] && [[ ${Uid[i]} ]]; then
                    local uids_2="$(echo $MainWP_UID,${Uid[i]} | perl -pe '{s|^|\"|; s|,|\",\"|g; s|$|\"|}')"
                elif [[ ! $(echo $MainWP_UID|grep -Eo 'UID_\w{28}') ]] && [[ ${Uid[i]} ]]; then
                    local uids_2="$(echo ${Uid[i]} | perl -pe '{s|^|\"|; s|$|\"|}')"
                elif [[ $(echo $MainWP_UID|grep -Eo 'UID_\w{28}') ]] && [[ ! ${Uid[i]} ]]; then
                    local uids_2="$(echo $MainWP_UID | perl -pe '{s|^|\"|; s|$|\"|}')"
                fi
                if [ "$uids_2" ]; then
                    if [[ $NOTIFY_SKIP_SAME_CONTENT = 1 ]]; then
                        [[ ${status[i]} = 1 || ! ${pin[i]} ]] && WxPusher_notify_api $WP_APP_TOKEN_ONE "$content_2" "$summary_2" "$uids_2"
                    fi
                fi
            done
        fi
    }

    valid_sub="$(def_sub JD_COOKIE status 0)"
    valid_pin=($(def_envs_tool JD_COOKIE | grep '"status": 0' | perl -pe "{s|.*pt_pin=([^; ]+)(?=;?).*|\1|}"))
    invalid_sub="$(def_sub JD_COOKIE status 1)"
    invalid_pin=($(def_envs_tool JD_COOKIE | grep '"status": 1' | perl -pe "{s|.*pt_pin=([^; ]+)(?=;?).*|\1|}"))
    if [[ ${#invalid_pin[@]} -gt 0 ]]; then
        if [[ $NOTIFY_SKIP_SAME_CONTENT = 1 ]] && [[ "${#invalid_pin[@]}" == "${#ori_invalid_pin[@]}" ]]; then
            echo -e "# 失效账号与上次检测结果一致，本次不推送。\n"
            invalid_ck_content=""
        else
            invalid_ck_content="$(temp_content1)"
        fi
    fi
    if [[ ${#valid_pin[@]} -gt 0 ]]; then
        if [[ $NOTIFY_SKIP_SAME_CONTENT = 1 ]] && [[ "${#valid_pin[@]}" == "${#ori_valid_pin[@]}" ]]; then
            echo -e "# 有效账号与上次检测结果一致，本次不推送。\n"
            valid_ck_content=""
        else
            [[ $NOTIFY_VALID_CK_TYPE = 1 ]] && valid_ck_content="$(temp_content2)" || valid_ck_content=""
        fi
    fi

    notify_one_to_one
}

## 文件下载工具
download_file(){
    get_remote_filesize(){
        local url="$1"
        curl -sI --connect-timeout 30 --retry 3 --noproxy "*" "$url" | grep -i Content-Length | awk '{print $2}'
    }

    get_local_filesize(){
       stat -c %s $1
    }

    get_md5(){
        md5sum $1 | cut -d ' ' -f1
    }

    local url="$1"
    local file_path="$2"
    file="${url##*/}"

    curl -C - -s --connect-timeout 30 --retry 3 --noproxy "*" "$url" -o $file_path/tmp_$file
    if [[ -f "$file_path/tmp_$file" ]]; then
        if [[ $(get_remote_filesize $url) -eq $(get_local_filesize $file_path/tmp_$file ) ]]; then
            if [[ -f "$file_path/$file" ]]; then
                [[ "$(get_md5 $file_path/$file)" != "$(get_md5 $file_path/tmp_$file)" ]] && mv -f $file_path/tmp_$file $file_path/$file || rm -rf $file_path/tmp_$file
            else
                mv -f $file_path/tmp_$file $2/$file
            fi
        fi
    fi
}

## 选择python3还是node
define_program() {
    local first_param=$1
    if [[ $first_param == *.js ]]; then
        which_program="node"
    elif [[ $first_param == *.py ]]; then
        which_program="python3"
    elif [[ $first_param == *.sh ]]; then
        which_program="bash"
    elif [[ $first_param == *.ts ]]; then
        which_program="ts-node-transpile-only"
    else
        which_program=""
    fi
}

wsck_to_ck(){
    if [[ $WSKEY_TO_CK = 1 ]] && [[ ${#wskey_value[@]} -gt 0 ]]; then
        if [[ $tmp10 ]]; then
            echo -e "# 检测到失效账号，开始搜索 wskey 转换脚本 ..."
            wskey_scr="$(find $dir_scripts -type f -name *wskey*.py | head -1)"
            if [[ -f $wskey_scr ]]; then
                echo -e "# 已搜索到 wskey 转换脚本，开始执行 wskey 转换 ..."
                define_program ${wskey_scr[0]}
                $which_program ${wskey_scr[0]}
                echo -e ""
            else
                if [[ $DOWNLOAD_WSKEY_SCR = 1 ]]; then
                    echo -e "# 未搜索到脚本，开始下载 wskey 转换脚本 ..."
                    [[ ! $WSKEY_SCR_URL ]] && WSKEY_SCR_URL="https://raw.fastgit.org/Zy143L/wskey/main/wskey.py"
                    download_file "$WSKEY_SCR_URL" $dir_scripts
                    wskey_scr="$file"
                    if [[ -f "$dir_scripts/$wskey_scr" ]]; then
                       echo -e "# wskey 转换脚本下载成功，开始执行 wskey 转换 ..."
                       define_program "$dir_scripts/$wskey_scr"
                       $which_program "$dir_scripts/$wskey_scr"
                       echo -e ""
                    else
                       echo -e "# wskey 转换脚本下载失败，跳过 wskey 转换 ..."
                       echo -e ""
                    fi
                else
                    echo -e "# 未搜索到 wskey 转换脚本，跳过 wskey 转换 ..."
                    echo -e ""
                fi
            fi
        fi
    fi
}

echo -e ""
echo -n "# 开始检查账号有效性"
[[ $NOTIFY_VALID_TIME = 1 || $NOTIFY_VALID_TIME = 2 ]] && echo -e "，预测账号有效期谨供参考 ..." || echo -e " ..."
verify_ck
wsck_to_ck

sort_notify_content
display_content="$(temp_content1)$(temp_content2)$temp_lt_1day$temp_no_wsck$temp_No_UID_1$temp_No_UID_2$temp_valid_time"
notify_content="$invalid_ck_content$valid_ck_content$temp_lt_1day$temp_no_wsck$temp_No_UID_1$temp_No_UID_2$temp_valid_time\n\n$ExNotify_Content"

if [[ $display_content ]]; then
    echo -e "$display_content"
    echo -e "# 推送通知..."
    notify "Cookie 状态通知" "$notify_content" >/dev/null 2>&1
    #if [[ $(echo $WP_APP_TOKEN_ONE|grep -Eo 'AT_(\w{32})') ]] && [[ $(echo $MainWP_UID|grep -Eo 'UID_\w{28}') ]]; then
    #    WxPusher_notify_content="Cookie 状态通知<br><br>$(echo $display_content | perl -pe '{s|\\n|<br>|g}')<br><br>$ExNotify_Content"
    #    uids="$(echo $MainWP_UID | perl -pe '{s|^|\"|; s|$|\"|}')"
    #   WxPusher_notify_api $WP_APP_TOKEN_ONE "$WxPusher_notify_content" "Cookie 状态通知" "$uids"
    #fi
fi

[[ $CK_WxPusherUid = 1 || $CK_WxPusherUid = 2 ]] && echo -e $temp_CK_WxPusherUid > $CK_WxPusherUid_dir/$CK_WxPusherUid_file
