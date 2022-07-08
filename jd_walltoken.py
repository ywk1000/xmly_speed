""" PagerMaid module to handle jd command. """

from pagermaid import version
from pagermaid.listener import listener
from pagermaid.utils import lang, alias_command, obtain_message, client


@listener(is_plugin=False, outgoing=True, command=alias_command("jx"),
          description="解析 JD 口令",
          parameters="<JD 口令>")

async def jx(context):
    try:
        text = await obtain_message(context)
    except ValueError:
        return await context.edit("[jx] " + lang("msg_ValueError"))
    try:
        M_API_TOKEN = "951306588:373af8dc89e801376a35e603cc558a9f"
        headers = {"token": M_API_TOKEN}
        data = (await client.post("http://ailoveu.eu.org:19840/jCommand",headers=headers, json={"code": text})).json()
        code = data.get("code")
        if code == 200:
            data = data["data"]
            await context.edit(f"[{data['title']}]({data['jumpUrl']})")
        else:
            return await context.edit(f"[jx] {data.get('data')} 口令！")
    except:
        return await context.edit("[jx] 网络错误！")
