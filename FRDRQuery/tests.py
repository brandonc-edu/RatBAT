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
            "field":"Trial_ID",
            "lookup":"lt",
            "value":110
        },
        {
            "field":"treatment__DrugRx_Drug1",
            "lookup":"exact",
            "value":"SAL"
        }
    ],
    "cache_path":"database/data/test_data",
    "dtypes":"pt",
    "save":true
}
"""