import django
import numpy as np
FIELD_LOOKUPS = ['exact',
                'iexact',
                'contains',
                'icontains',
                'in',
                'gt',
                'gte',
                'lt',
                'lte',
                'startswith',
                'istartswith',
                'endswith',
                'iendswith',
                'range',
                'date',
                'year',
                'iso_year',
                'month',
                'day',
                'week',
                'week_day',
                'iso_week_day',
                'quarter',
                'time',
                'hour',
                'minute',
                'second',
                'isnull',
                'regex',
                'iregex']

def get_foreign_keys(model):
    fkeys = []
    for col in model._meta.get_fields():
        if isinstance(col, django.db.models.ForeignKey):
            fkeys.append(col)
    return fkeys

def build_model(model,data,replace = False):

    data.replace(np.nan,None, inplace = True)
    # Replace foreign key references ids with actual referenced model
    fkeys = get_foreign_keys(model)
    fkeys = {key.name:key for key in fkeys}

    row_models = []
    for _,row in data.iterrows():
        row_dict = {}
        for col, val in row.items():
            if col in fkeys:
                row_dict[col] = fkeys[col].related_model.objects.get(**{col:val})
            else:
                row_dict[col] = val

        row_models.append(model(**(row_dict)))
    if replace:
        model.objects.all().delete()
    model.objects.bulk_create(row_models)