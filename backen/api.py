import re

from config import config
from fastapi import FastAPI, HTTPException, Query, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.encoders import jsonable_encoder

from luojiasql.dataModel import multiRoundsRequest, QuestionSQLPair, Document, DDLInfo, SetLLMModel
from luojiasql.api.frontend import SQLFrontend


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:5174"],  # 或指定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sqlfrontend = SQLFrontend(config=config)

sqlfrontend.connect_to_oracle(user='user',password='password',dsn='127.0.0.1:1522/orcl')


@app.get("/api/allModels")
def getAllModels():
    modelList = sqlfrontend.getAllModel()
    return {'modelList': modelList}

@app.get("/api/getCurrentModel")
def getCurrentModel():
    modelName = sqlfrontend.getCurrentModel()
    return {'modelName': modelName}


@app.post("/api/setLMMModel")
def setLMMModel(request: SetLLMModel):
    try:
        if modelName in sqlfrontend.getAllModel():
            sqlfrontend.update_llm_model(request.modelName)
            return {'status': 'success'}
        else:
            return {'status': 'error'}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}


@app.post("/api/getData")
async def get_data(payload: dict = Body(...)):
    try:
        return JSONResponse(content=sqlfrontend.generate_data(payload.get("llm_response")))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"数据生成失败：{str(e)}")

@app.get('/api/multiRounds')
async def multiRounds(req:multiRoundsRequest):
        return StreamingResponse(sqlfrontend.return_multiRounds_process(**req.params),media_type="text/event-stream; charset=utf-8")

@app.get('/api/return_sick_summary')
async def return_sick_summary():
    return StreamingResponse(sqlfrontend.return_sick_summary(),media_type="text/event-stream; charset=utf-8")


@app.get('/api/reSend')
async def reSend(question:str=Query(...)):
    return StreamingResponse(sqlfrontend.return_multiRounds_process(question),
                             media_type="text/event-stream; charset=utf-8")



@app.post('/api/getSelect')
async def getSelect(payload: dict = Body(...)):
    try:
        return JSONResponse(content=sqlfrontend.return_select(**payload))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"发生错误{str(e)}")
