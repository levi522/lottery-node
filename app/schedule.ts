import sendNft from "./sendNft";
import query from "./query"
import { update } from "lodash";

const schedule = require('node-schedule');

// 定义规则
let rule = new schedule.RecurrenceRule();
rule.second = [0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11,
    12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
    36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59];

const endDate = new Date("2022-06-08 14:50:00")

const nftsToken = ["HUBbbkASHiZDY8p545hiz2hNypqxbgcQaSYKiab2nnDZ"]

let job = schedule.scheduleJob(endDate, async () => {
    console.log("进入定时器")
    try {
        const sql = "select * from lottery";
        let lotteryWalletList = await query(sql);
        while (lotteryWalletList.length == 0) {
            await sleep(1000)
            lotteryWalletList = await query(sql);
            console.log("获取lottery")
        }
        console.log("lotteryWalletList:",lotteryWalletList)
        lotteryWalletList.map(async (lotteryWallet: any, index: any) => {
            let walletAddress = lotteryWallet["lottery_wallet"]
            let status = lotteryWallet["status"]
            let id = lotteryWallet["id"]
            console.log("index:",index)
            if (status == 0) {
                console.log("通过状态")
                let response = await sendNft(nftsToken[index], walletAddress)
                console.log("response", response)
                if (response != null && response != undefined) {
                    let updateSql = "update lottery set status = 1 where id = " + id
                    let updateSqlResponse = await query(updateSql);
                    console.log("updateSqlResponse", updateSqlResponse)
                }
            }
        })
    } catch (e) {
        console.log(e)
    }

});

function sleep(ms:any) {
    return new Promise(resolve=>setTimeout(resolve, ms))
}

