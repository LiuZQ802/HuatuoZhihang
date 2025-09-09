"""
配置文件
"""
config = {
    'llm_type': 'api',

    "ollama_host": "http://localhost:11434",

    "ollama_timeout": 240.0,
    "keep_alive": None,
    "options": {},
    "num_ctx": 2048,

    "model_lists":[
        {
            "provider":"ollama",
            "model_name":"HuatuoZhihang",
            "show_name":"HuatuoZhihang",
            "base_url":"http://localhost:11434",
            "api_key": "KEY",
        },
        {
            "provider":"ollama",
            "model_name":"HuatuoZhihangVision",
            "show_name":"HuatuoZhihangVision",
            "base_url":"http://localhost:11434",
        },
    ],
    "default_model":{
            "provider":"ollama",
            "model_name":"HuatuoZhihangVision",
            "show_name":"HuatuoZhihangVision",
            "base_url":"http://localhost:11434",
    },
}