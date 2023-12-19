const asyncHandler = (requestHandler) => {
    (req, res, next)=> {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
    } 
}


export {asyncHandler};



/*
    // This is another method to handle async errors.
    // This is a custom middleware that will handle all the errors that are thrown inside the async functions.
    // It will catch the error and send a response to the client with the error message.
    // We w

const asyncHandler = (fn) => async(req, res, next) => {
    try{
        await fn(req, res, next);
    }catch(error){
        res.status(err.code || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        })
    }
}

*/