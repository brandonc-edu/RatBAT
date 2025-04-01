import requests
"""
{
"filters":[
        {
            "field":"trial_id",
            "lookup":"lt",
            "value":110
        }
    ],
"fields":["drugrx_drug1","projectdesc"]
}
"""
"""
params = {"filters":filters, "fields":fields}

response = requests.post('http://127.0.0.1:8000/api/query-data/',data = params)
print(response.status_code)
print(response.text)
"""
"""
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()

request = factory.post("/api/query-data/",{"filters":
                                           [{"field":"trial__Trial_ID",
                                             "lookup":"exact",
                                             "value":100}
                                            ],
                                            "cache_path":"database/data/test_data",
                                            "dtypes":"pt",
                                            "save":True },
                                            content_type="applicaton/json")
"""
"""

{
 "trials":[1,2,3,4,5]
}

{
    "filters":[
        {
            "field":"trial_id",
            "lookup":"lt",
            "value":110
        },
        {
            "field":"drugrx_drug1",
            "lookup":"exact",
            "value":"QNP"
        }
    ],
    "cache_path":"database/data/test_data",
    "dtypes":"pt"
}
{
    "filters":[
        {
            "field":"trial_id",
            "lookup":"lt",
            "value":50
        }
    ],
    "cache_path":"database/data/test_data",
    "dtypes":"t"
}

{
    "filters":[
        {
            "field":"trial_id",
            "lookup":"lt",
            "value":50
        },
        {
            "field":"arenaobjectsdesc",
            "lookup":"exact",
            "value":"empty with no objects in Activity Monitor (AM) cage"
        }
    ],
    "fields":["drugrx_drug1","project_desc"]

{
    "filters":[
        {
            "field":"trial_id",
            "lookup":"gt",
            "value":13185
        },
        {
            "field":"trial_id",
            "lookup":"lt",
            "value":13197
        }
    ],
    "cache_path":"database/data/test_data",
    "dtypes":"t"
}
    
"""