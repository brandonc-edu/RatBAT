"""
Filename: db_helper.py
Author(s): Daniel Locke
Created: 2025/01/21
Last Modified: 2025/03/05
Description: General use functions and variables to assist with database interaction.
"""

import django
import numpy as np

# All built in django field lookup values to be used as filters.
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
    """For a given database table model returns all foreign key fields.

    Parameters
    ----------
    model : django.db.models.base.ModelBase
        Django model class
    
    Returns
    -------
    List of foreign keys in the model.
    """

    fkeys = []
    for col in model._meta.get_fields():
        if isinstance(col, django.db.models.ForeignKey):
            fkeys.append(col)
    return fkeys



def get_relationship(start, dest, searched = None):
    """Recursive pathfinding algorithm to determine the relationship between
    a database table and some field in the database.

    Parameters
    ----------
    start : django.db.models.base.ModelBase
        Model class who's relationship to the destination field is of interest.
    dest : str
        Field name whos relationship to the starting model is of interest.
    
    Returns
    -------
    str
    Path from the starting model to the destination field.
    """
    
    # Default parameter None instead of set() to avoid reuse of default set created at function definition.
    if searched == None:
        searched = set()

    searched.add(start._meta.model_name)
    next = set()
    for field in start._meta.get_fields():
        if field.name == dest:
            return f"{start._meta.model_name}__{field.name}"
        elif (isinstance(field,django.db.models.ForeignKey) or isinstance(field,django.db.models.fields.reverse_related.ManyToOneRel)) and not field.name in searched:
            next.add(field.related_model)

    while len(next) > 0:
        next_model = next.pop()
        path = get_relationship(next_model,dest,searched)
        if not path == None:
            return f"{start._meta.model_name}__{path}"
    return None

def build_model(model, data, replace=False, do_async=False):
    """Function to translate a pandas dataframe into a Django model to be stored in the database.

    Parameters
    ----------
    model : django.db.models.base.ModelBase
        Model class to store the data in.
    data : pandas.DataFrame
        Data to be stored in the database
    replace : bool
        If True all data existing data in the provided table will be deleted and replaced with given data.
        Defaults to False.
    do_async : bool
        If True, data will be added to the database asynchronously.
        Defaults to False.
    """
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

def update_timeseries(model, data):
    """Function to translate a pandas dataframe into a Django model to be stored in the database.

    Parameters
    ----------
    model : django.db.models.base.ModelBase
        Model class to store the data in.
    data : pandas.DataFrame
        Data to be stored in the database
    pkeys : list
        List of primary key labels.
    """
    
    data.replace(np.nan, None, inplace = True)
    # Replace foreign key references ids with actual referenced model
    fkeys = get_foreign_keys(model)
    fkeys = {key.name:key for key in fkeys}
    
    row_models = list(model.objects.filter(trial__trial_id__in = data["trial_id"]))
    if len(row_models) == 0:
        raise Exception("Timeseries data must exist in order to add smoothed data.")
    
    for i in range(len(data.index)):
        row_models[i].x_s = data.loc[i,"x_s"]
        row_models[i].y_s = data.loc[i,"y_s"]
        row_models[i].v_s = data.loc[i,"v_s"]
        row_models[i].movementtype_s = data.loc[i,"movementtype_s"] 
    start = time.time()
    model.objects.bulk_update(row_models, ["x_s","y_s","v_s","movementtype_s"], batch_size = 100)
    print(time.time()-start)