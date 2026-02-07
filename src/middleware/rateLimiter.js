const {getClient} = require("../config/redis")

const rateLimiter = async (req,res,next) => {
    try{
        const key = `userIp:${req.ip}`;
        const client = getClient();
        const requests = await client.incr(key);

        if(requests === 1){
            await client.expire(key,60)
        }

        if(requests > 10){
            return res.status(429).json({
                message:"Too many Requests.Please try again after sometime"
            })
        }else{
            next();
        }
        
    }catch(error){
        console.error(`Error in rateLimiter ${error}`);
        return res.status(500).json({
            error: error.message
        })
    }
}

module.exports = rateLimiter