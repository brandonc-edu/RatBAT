import React from 'react';
import PropTypes from 'prop-types';
//import { headerMapping } from '.../config/categories';
import './DataWindow.css';

const headerMapping = {
  "experimentgroup__experiment__studygroup__study__projectgroup__project__project_id": "Project ID",
  "experimentgroup__experiment__studygroup__study__projectgroup__project__projectdesc": "Project Desc",
  "experimentgroup__experiment__studygroup__study__study_id": "Study ID",
  "experimentgroup__experiment__studygroup__study__studydesc": "Study Desc",
  "experimentgroup__experiment__experiment_id": "Experiment ID",
  "experimentgroup__experiment__experimentdesc": "Experiment Desc",
  "trial_id": "Trial ID",
  "dateandtime": "Date and Time",
  "animalweight": "Animal Weight",
  "injectionnumber": "Injection Number",
  "oftestnumber": "Oftest Number",
  "drugrxnumber": "Drug Rx Number",
  "experimenter": "Experimenter",
  "duration": "Duration",
  "fallsduringtest": "Falls During Test",
  "notes": "Notes",
  "trackfile": "Track File",
  "pathplot": "Path Plot",
  "video_id": "Video ID",
  "video": "Video",
  "eventtype__eventtype_id": "Event Type ID",
  "eventtype__eventtypedesc": "Event Type Desc",
  "animal__animal_id": "Animal ID",
  "animal__lightcyclecolony__lightcyclecolony_id": "Light Cycle Colony ID",
  "animal__lightcyclecolony__lightcyclecolonydesc": "Light Cycle Colony Desc",
  "animal__lightcycletest__lightcycletest_id": "Light Cycle Test ID",
  "animal__lightcycletest__lightcycletestdesc": "Light Cycle Test Desc",
  "apparatus__apparatus_id": "Apparatus ID",
  "apparatus__arenatype__arenatype_id": "Arena Type ID",
  "apparatus__arenatype__arenatypedesc": "Arena Type Desc",
  "apparatus__arenaloc__arenaloc_id": "Arena Location ID",
  "apparatus__arenaloc__arenalocdesc": "Arena Location Desc",
  "apparatus__arenaobjects__arenaobjects_id": "Arena Objects ID",
  "apparatus__arenaobjects__arenaobjectsdesc": "Arena Objects Desc",
  "apparatus__lightconditions__lightconditions_id": "Light Conditions ID",
  "apparatus__lightconditions__lightconditionsdesc": "Light Conditions Desc",
  "treatment__treatment_id": "Treatment ID",
  "treatment__surgerymanipulation__surgerymanipulation_id": "Surgery Manipulation ID",
  "treatment__surgerymanipulation__surgerymanipulationdesc": "Surgery Manipulation Desc",
  "treatment__surgeryoutcome__surgeryoutcome_id": "Surgery Outcome ID",
  "treatment__surgeryoutcome__surgeryoutcomedesc": "Surgery Outcome Desc",
  "treatment__drugrx_drug1": "Drug Rx Drug 1",
  "treatment__drugrx_dose1": "Drug Rx Dose 1",
  "treatment__drugrx_drug2": "Drug Rx Drug 2",
  "treatment__drugrx_dose2": "Drug Rx Dose 2",
  "treatment__drugrx_drug3": "Drug Rx Drug 3",
  "treatment__drugrx_dose3": "Drug Rx Dose 3"
};

const DataWindow = ({ data }) => {
  console.log("DataWindow received data:", data);
  const headers = data && data.length > 0 ? Object.keys(data[0]) : [];
  const displayHeaders = headers.map(header => headerMapping[header] || header);
  console.log("mappedFields", displayHeaders);
  return (
    <div className="data-window">
      {data && data.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {displayHeaders.map(header => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  {headers.map(header => (
                    <td key={header}>{item[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-matching-entries">No matching entries found.</p>
      )}
    </div>
  );
};

DataWindow.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DataWindow;