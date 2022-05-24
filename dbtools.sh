#!/usr/bin/env bash

## 版本号
Ver="Build 20220329-001-Alpha"

## 导入通用变量与函数
dir_shell=/ql/shell
. $dir_shell/share.sh
. $dir_shell/api.sh

# 定义 json 数据查询工具
def_envs(){
    . $dir_shell/api.sh
    curl -s --noproxy "*" "http://0.0.0.0:5600/api/envs" -H "Authorization: Bearer $token" | jq .data
}

def_crons(){
    . $dir_shell/api.sh
    curl -s --noproxy "*" "http://0.0.0.0:5600/api/crons" -H "Authorization: Bearer $token" | jq .data
}

#青龙添加环境变量API
ql_add_env_api() {
    local currentTimeStamp=$(date +%s)
    local name=$1
    local value=$2
    local remarks=$3
    local url="http://0.0.0.0:5600/api/envs"

    . $dir_shell/api.sh
    if [[ $remarks ]]; then
        local api=$(
            curl -s --noproxy "*" "$url?t=$currentTimeStamp" \
                -X 'POST' \
                -H "Accept: application/json" \
                -H "Authorization: Bearer $token" \
                -H "Content-Type: application/json;charset=UTF-8" \
                --data-raw "[{\"name\":$name,\"value\":$value,\"remarks\":$remarks}]"
        )
    else
        local api=$(
            curl -s --noproxy "*" "$url?t=$currentTimeStamp" \
                -X 'POST' \
                -H "Accept: application/json" \
                -H "Authorization: Bearer $token" \
                -H "Content-Type: application/json;charset=UTF-8" \
                --data-raw "[{\"name\":$name,\"value\":$value}]"
        )
    fi
    code=$(echo $api | jq -r .code)
    message=$(echo $api | jq -r .message)
    if [[ $code == 200 ]]; then
        echo -e "$name -> 添加成功"
    else
        echo -e "$name -> 添加失败(${message})"
    fi
}

#青龙添加定时任务API
ql_add_cron_api() {
    local currentTimeStamp=$(date +%s)
    local schedule=$1
    local command=$2
    local name=$3
    local url="http://0.0.0.0:5600/api/crons"

    . $dir_shell/api.sh
    local api=$(
        curl -s --noproxy "*" "$url?t=$currentTimeStamp" \
            -H "Accept: application/json" \
            -H "Authorization: Bearer $token" \
            -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36" \
            -H "Content-Type: application/json;charset=UTF-8" \
            -H "Origin: http://0.0.0.0:5700" \
            -H "Referer: http://0.0.0.0:5700/crontab" \
            -H "Accept-Language: en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7" \
            --data-raw "{\"name\":${name},\"command\":${command},\"schedule\":${schedule}}" \
            --compressed
    )
    code=$(echo $api | jq -r .code)
    message=$(echo $api | jq -r .message)
    if [[ $code == 200 ]]; then
        echo -e "$name -> 添加成功"
    else
        echo -e "$name -> 添加失败(${message})"
    fi
}

## 导入添加环境变量
ql_add_envs(){
    local i param name value remarks
    if [[ -f $dir_scripts/envs.json ]]; then
        echo -e "# 开始导入环境变量数据"
        for ((i = 0; i <= 10000; i++)); do
            for param in name value remarks; do
                eval $param='$(jq .[$i].$param $dir_scripts/envs.json | grep -v null)'
                [[ $(eval echo \$$param) ]] && eval echo \$$param
            done
            [[ ! ${name} || ${name} = null ]] && break
            ql_add_env_api "${name}" "${value}" "${remarks}"
        done
    else
        echo -e "# 未发现 $dir_scripts/envs.json 文件，请检查后重试！"
    fi
}

## 导入添加定时任务
ql_add_crons(){
    local i param name command schedule
    if [[ -f $dir_scripts/envs.json ]]; then
        for ((i = 0; i <= 10000; i++)); do
            for param in name command schedule; do
                eval $param='$(jq -r .[$i].$param $dir_scripts/crons.json | grep -v null)'
                [[ $(eval echo \$$param) ]] && eval echo \$$param
            done
            [[ ! ${name} || ${name} = null ]] && break
            add_cron_api "${schedule}" "${command}" "${name}"
        done
    else
        echo -e "# 未发现 $dir_scripts/crons.json 文件，请检查后重试！"
    fi
}

## 帮助
tools_help(){
    echo -e ""
    echo -e "使用方法："
    echo -e "\tbash $LOCAL_DIR/dbtools.sh 0\t导出环境变量数据"
    echo -e "\tbash $LOCAL_DIR/dbtools.sh 1\t导出定时任务数据"
    echo -e "\tbash $LOCAL_DIR/dbtools.sh 2\t导入环境变量数据"
    echo -e "\tbash $LOCAL_DIR/dbtools.sh 3\t导入定时任务数据"
    echo -e ""
}


main() {
    LOCAL_DIR="$(cd $(dirname ${BASH_SOURCE:-$0});pwd)"
    echo -e ""
    echo -e "# 当前版本：$Ver\n"
    case $1 in
        0)
            echo -e "# 开始导出环境变量至 $dir_scripts/envs.json 文件"
            [[ -f $dir_scripts/envs.json ]] && mv -f $dir_scripts/envs.json $dir_scripts/envs_bak.json
            def_envs > $dir_scripts/envs.json
            [[ -f $dir_scripts/envs.json ]] && echo -e "# 已将环境变量导出至 $dir_scripts/envs.json 文件" || echo -e "# 环境变量导出失败，请稍后重试！"
            ;;
        1)
            echo -e "# 开始导出定时任务至 $dir_scripts/crons.json 文件"
            [[ -f $dir_scripts/crons.json ]] && mv -f $dir_scripts/crons.json $dir_scripts/crons_bak.json
            def_crons > $dir_scripts/crons.json
            [[ -f $dir_scripts/crons.json ]] && echo -e "# 已将定时任务导出至 $dir_scripts/crons.json 文件" || echo -e "# 定时任务导出失败，请稍后重试！"
            ;;
        2)
            ql_add_envs
            ;;
        3)
            ql_add_crons
            ;;
        *)
            tools_help
            ;;
    esac
}

main "$@"
