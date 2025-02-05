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


def get_relationship(start,dest,searched = None) -> (str|None):
    # Default parameter None instead of set() to avoid reuse of default set created at function definition.
    if searched == None:
        searched = set()
    searched.add(start._meta.model_name)
    next = set()
    for field in start._meta.get_fields():
        if field.name == dest:
            return f"{start._meta.model_name}__{field.name}"
        elif isinstance(field,django.db.models.ForeignKey) and not field.name in searched:
            next.add(field.related_model)

    while len(next) > 0:
        next_model = next.pop()
        path = get_relationship(next_model,dest,searched)
        if not path == None:
            return f"{start._meta.model_name}__{path}"
    return None

def build_model(model,data,replace=False,do_async=False):
    data.replace(np.nan,None, inplace = True)
    # Replace foreign key references ids with actual referenced model
    fkeys = get_foreign_keys(model)
    fkeys = {key.name:key for key in fkeys}

    row_models = []
    for _,row in data.iterrows():
        row_dict = {}
        for col, val in row.items():
            if col.replace("_ID","").lower() in fkeys:
                row_dict[col.replace("_ID","").lower()] = fkeys[col.replace("_ID","").lower()].related_model.objects.get(**{col.lower():val})
            else:
                row_dict[col.lower()] = val

        row_models.append(model(**(row_dict)))
    if replace:
        model.objects.all().delete()
    
    if do_async:
        model.objects.abulk_create(row_models, batch_size = 50000, ignore_conflicts = True)
    else:
        model.objects.bulk_create(row_models, batch_size = 50000, ignore_conflicts = True)
