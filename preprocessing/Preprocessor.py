# Imports
from . smoothing import lowess, repeated_running_medians
from . segmentation import segment_path
from functools import partial
import numpy as np

DEFAULT_PARAMS = {
    "LOWESS" : {
        "deg" : 2,
        "half_window" : 24,
        "num_iter" : 2
    },
    "RRM" : {
        "half_windows" : [3, 2, 1, 1], # TODO: Get actual defaults from Anna
        "min_arr" : 5,        # TODO: Get actual defaults from Anna
        "tol" : 0.0001        # TODO: Get actual defaults from Anna (especially this one, as it specifically mentions that rats needs a larger parameter)
    },
    "EM" : {
        "tol" : 0.0001,           # TODO: Get actual defaults from Anna
        "half_window" : 12,    # TODO: Get actual defaults from Anna
        "log_transform" : np.log10, # TODO: Get actual defaults from Anna
        "num_guesses" : 2,   # TODO: Get actual defaults from Anna. Note: Just pure guesses as I wasn't actually able to locate a default in the actual segmentation paper. It calculates its num_guesses while calculating k.
        "num_iters" : 2,     # TODO: Get actual defaults from Anna. Note: Just pure guesses as I wasn't actually able to locate a default in the actual segmentation paper. It calculates its num_guesses while calculating k.
        "significance" : None,  # TODO: Get actual defaults from Anna. Note: since we're using k, we don't need to specify significance.
        "k" : 2
    }
}

class Preprocessor:
    def __init__(self, function_params=None):
        """
            function_params is a dict of dicts, with each inner dict corresponding to each major function, with their keys being function parameters and values the parameter values
        """
        self.lowess_params = DEFAULT_PARAMS["LOWESS"]
        self.rrm_params = DEFAULT_PARAMS["RRM"]
        self.em_params = DEFAULT_PARAMS["EM"]

        # Update params if there are any modifications from the default
        self.set_lowess_params(function_params)
        self.set_rrm_params(function_params)
        self.set_em_params(function_params)

        # Create the partial functions for the preprocessor to run
        self.lowess_func = partial(lowess, deg=self.lowess_params["deg"], half_window=self.lowess_params["half_window"], num_iter=self.lowess_params["num_iter"])
        self.rrm_func = partial(repeated_running_medians, half_windows=self.rrm_params["half_windows"], min_arr=self.rrm_params["min_arr"], tol=self.rrm_params["tol"])
        self.em_func = partial(segment_path, tol=self.em_params["tol"], half_window=self.em_params["half_window"], log_transform=self.em_params["log_transform"],
                               num_guesses=self.em_params["num_guesses"], num_iters=self.em_params["num_iters"], significance=self.em_params["significance"], 
                               k=self.em_params["k"])

    def preprocess_data(self, data):
        """
            Preprocesses the incoming data.

            Data is of the form: [frame, x-coordinates, y-coordinates]
        """
        ## Should the backend pass all the data files to my interface, or just do it one at a time.
        ## Personally, I think one at a time. Our RAM will be limited, and loading everything into memory might be unideal.

        # Run LOWESS (lowess)
        transformed_data = self.smooth_dataset(data)
        
        # Run RRM (repeated_running_medians)
        arrests = self.identify_arrests(data)
        # arrests = [(10, 150), (600, 650), (1200, 12000)]

        # Calculate interpolations & velocity
        transformed_data = self.interpolate_and_velocity(transformed_data, arrests)

        # Run EM (segment_path)
        transformed_data = self.em_func(transformed_data)

        return transformed_data
    
    def smooth_dataset(self, data):
        """
            Given a dataset of the form [frame, x, y], smooth it and calculate the velocities.
        """
        transformed_data = data

        # Run LOWESS (lowess)
        transformed_X, vel_X = self.lowess_func(transformed_data[:, 1])
        transformed_Y, vel_Y = self.lowess_func(transformed_data[:, 2])

        ## Apply smoothed data changes
        transformed_data[:, 1] = transformed_X
        transformed_data[:, 2] = transformed_Y

        ## Calculate and concatenate velocities to the transformed dataset
        velocities = np.sqrt(np.square(vel_X) + np.square(vel_Y)).reshape((-1, 1))
        transformed_data = np.hstack((transformed_data, velocities))
        
        return transformed_data

    
    def identify_arrests(self, data):
        """
            Given a dataset of the form [frame, x, y], determine the arrests using RRM.
        """
        # Find arrests for both x & y coords
        _, arrests_X = self.rrm_func(data[:, 1])
        _, arrests_Y = self.rrm_func(data[:, 2])

        # Get mask of shared arrests
        x_mask = np.zeros((len(data)), dtype=bool)
        y_mask = np.zeros((len(data)), dtype=bool)
        for xArrest_start, xArrest_end in arrests_X:
            x_mask[xArrest_start - 1 : xArrest_end] = True
        for yArrest_start, yArrest_end in arrests_Y:
            y_mask[yArrest_start - 1 : yArrest_end] = True

        arrest_mask = np.bitwise_and(x_mask, y_mask)
        arrest_mask_length = len(data)

        # From the shared arrests, add their start and end points to the final arrest list
        arrests = []
        in_interval = False
        start = None
        for i in range(len(arrest_mask)):
            if not in_interval and arrest_mask[i]:
                start = i + 1
                in_interval = True
            elif in_interval and not arrest_mask[i]:
                arrests.append((start, i))
                in_interval = False
            elif in_interval and i == arrest_mask_length - 1:
                arrests.append((start, i + 1))

        return arrests

    def interpolate_and_velocity(self, data, arrests):
        """
            Takes in LOWESS data and arrest intervals. Returns data with interpolated coordinates and velocity.
        """
        # arrest mask
        for start, end in arrests:
            arrest_length = end - (start - 1) 
            # Linear interpolation of the x, y coordinates during the arrests
            data[start - 1 : end, 1] = np.linspace(data[start - 1, 1], data[end - 1, 1], arrest_length) # X
            data[start - 1 : end, 2] = np.linspace(data[start - 1, 2], data[end - 1, 2], arrest_length) # Y

            # Velocity setting -> set velocity equal to 0 for all arrests
            data[start - 1 : end, 3] = 0 

        return data

    def set_lowess_params(self, parameter_dict):
        if parameter_dict != None and len(parameter_dict) != 0:
            for param, val in parameter_dict["LOWESS"].items():
                self.lowess_params[param] = val
    
    def set_rrm_params(self, parameter_dict):
        if parameter_dict != None and len(parameter_dict) != 0:
            for param, val in parameter_dict["RRM"].items():
                self.rrm_params[param] = val
    
    def set_em_params(self, parameter_dict):
        if parameter_dict != None and len(parameter_dict) != 0:
            for param, val in parameter_dict["EM"].items():
                self.em_params[param] = val

