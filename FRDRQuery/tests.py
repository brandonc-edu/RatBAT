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
#Note don't include table name for trial table
"""
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
    "dtypes":"pt",
    "save":true
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
    "cache_path":"database/data/test_data",
    "dtypes":"pt",
    "save":true
}
"""