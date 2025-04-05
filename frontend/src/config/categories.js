export const categories = [
    {
      category: "project",
      displayName: "Project",
      fields: [
        { name: "project_id", displayName: "project id", type: "number" },
        { name: "projectdesc", displayName: "project desc", type: "discrete",
          options: ["Probing the neural circuit mediating sensitization and compulsive checking",
            "Probing the neurochemistry of sensitization and compulsive checking",
            "Pharmacology of sensitization and compulsive checking",
            "Probing for drugs that mitigate sensitization and compulsive checking",
            "Probing the mode of action of mCPP on compulsive checking",
            "Probing the mode of action of quinpirole on behavior",
            "Probing the role of hormones in compulsive checking",
            "Probing the parameters of sensitization and compulsive checking",
            "Probing the environmental modulation of sensitization and compulsive checking",
            "Probing for comorbidity",
            "Probing for biological markers of the pathogenesis of compulsive checking",
            "Resynthesis of compulsive checking"
          ]
         }
      ]
    },
    {
      category: "study",
      displayName: "Study",
      fields: [
        { name: "study_id", displayName: "study id", type: "text" },
        { name: "studydesc", displayName: "study desc", type: "text" }
      ]
    },
      {
        category: "experiment",
        displayName: "Experiment",
        fields: [
          { name: "experiment_id", displayName: "experiment id", type: "number" },
          { name: "experimentdesc", displayName: "experiment desc", type: "text" }
        ]
    },
    {
      category: "trial",
      displayName: "Trial",
      fields: [
        { name: "trial_id", displayName: "trial id", type: "number" },
        { name: "dateandtime", displayName: "date and time", type: "datetime" },
        { name: "animalweight", displayName: "animal weight", type: "number" },
        { name: "injectionnumber", displayName: "injection number", type: "number" },
        { name: "oftestnumber", displayName: "oftest number", type: "number" },
        { name: "drugrxnumber", displayName: "drugrx number", type: "number" },
        { name: "experimenter", displayName: "experimenter", type: "text"},
        { name: "duration", displayName: "duration", type: "number" },
        { name: "fallsduringtest", displayName: "falls during test", type: "number" },
        { name: "notes", displayName: "notes", type: "text" },
        { name: "trackfile", displayName: "track file", type: "text" },
        { name: "pathplot", displayName: "path plot", type: "text" },
        { name: "video_id", displayName: "video id", type: "number" },
        { name: "video", displayName: "video", type: "text" },
        { name: "eventtype_id", displayName: "event type id", type: "number" },
        { name: "eventtypedesc", displayName: "event type desc",type: "discrete",
          options: [
            "Standard OF trial",
            "Test for conditioned effects",
            "Test for sensitization",
            "Object rotation test",
            "Light/dark test",
            "Test with 0.1mg/kg QNP",
            "Filmed in activity cages",
            "EPM",
            "10min OF test before sacrifice",
            "Test with 2 drugs injected",
            "Drug substitution test",
            "SAL instead 2nd drug",
            "Test with 0.1mg/kg DPAT",
            "Test without objects in OF",
            "Test with 3 drugs injected (Ritanserin reversal trials)"
          ] }
      ]
    },
    {
        category: "animal",
        displayName: "Animal",
        fields: [
          { name: "animal_id",displayName: "animal id", type: "number" },
          { name: "lightcyclecolony_id", displayName: "light cycle colony id", type: "number" },
          { name: "lightcyclecolonydesc", displayName: "light cycle colony desc", type: "discrete",
            options: ["Lights ON 7 AM to 7 PM in housing colony"] },
          { name: "lightcycletest_id", displayName: "light cycle test id", type: "number" },
          { name: "lightcycletestdesc", displayName: "light cycle test desc", type: "discrete",
            options: ["Tested during subjective night/sleep cycle (lights ON)", "Tested during subjective day/activity cycle (lights OFF)"] } 
        ]
    },
    {
        category: "apparatus",
        displayName: "Apparatus",
        fields: [
          { name: "apparatus_id", displayName: "apparatus id", type: "number" },
          { name: "arenatype_id", displayName: "arena type id", type: "number" },
          { name: "arenatypedesc", displayName: "arena type desc", type: "discrete",
            options: ["160x160 cm table surface on 60 cm high legs", "160x160x60 cm table with a 5 cm high Plexiglas border at edges", 
              "Circular arena 220 cm in diameter and with a 50 cm high wall", "Elevated plus maze", "Plexiglas box 40x40x35 cm"
            ] },
          { name: "arenaloc_id", displayName: "arena location id", type: "number" },
          { name: "arenalocdesc", displayName: "arena location desc", type: "discrete",
            options: ["OF #1 in room U59_south", "OF #2 in room U59_north", "OF #3 in room U60_south", "OF #4 in room U60_north",
              "Circular arena in room EPM_room", "Activity box in room ActivityMonitorCages_room"
            ] },
          { name: "arenaobjects_id", displayName: "arena objects id", type: "number" },
          { name: "arenaobjectsdesc", displaytName: "arena object desc", type: "discrete",
            options: ["empty with no objects in arena", "an object in OF locales 10 14 5 and 8", "objects ROTATION 180 deg to locales 18 22 9 and 4",
              "empty with no objects in Activity Monitor (AM) cage"
            ] },
          { name: "lightconditions_id", displayName: "light conditions id", type: "number" },
          { name: "lightconditionsdesc", displayName: "light condition desc", type: "discrete",
            options: ["room ILLUMINATED (fluorescent lights ON)", "room DARK (infrared lights ON)"] }

        ]
    },
    {
        category: "treatment",
        displayName: "Treatment",
        fields: [
          { name: "treatment_id", displayName: "treatment id", type: "number" },
          { name: "surgerymanipulation_id", displayName: "surgery manipulation id", type: "number" },
          { name: "surgerymanipulationdesc", displayName: "surgerymanipulation desc",type: "discrete",
            options: ["No surgery done", "Sham lesion done", "Infralimbic Ctx (ILC) targeted", "Basal Lateral Amygdala (BLA) targeted",
              "Nucleus Accumbens Core (NAc) targeted", "Orbital Frontal Ctx (OFC) targeted", "Pituitary targeted"
             ] },
          { name: "surgeryoutcome_id", displayName: "surgery outcome id", type: "number" },
          { name: "surgeryoutcomedesc", displayName: "surgery outcome desc", type: "discrete",
            options: ["No lesion present", "Lesion meets criterion of at least 55% of ROI lesioned bilaterally", "Lesion does NOT meet criteria",
              "Complete hypophysectomy", "Histology not available"
            ] },
          { name: "drugrx_drug1", displayName: "drugrx drug 1", type: "text" },
          { name: "drugrx_dose1", displayName: "drugrx dose 1", type: "number" },
          { name: "drugrx_drug2", displayName: "drugrx drug 2", type: "text" },
          { name: "drugrx_dose2", displayName: "drugrx dose 2", type: "number" },
          { name: "drugrx_drug3", displayName: "drugrx drug 3", type: "text" },
          { name: "drugrx_dose3", displayName: "drugrx dose 3", type: "number" }
        ]
    }

    // REMOVED FILTERS... Not relevant to filters
    // {
    //     category: "fall",
    //     displayName: "Fall",
    //     fields: [
    //       { name: "timewhenfell", displayName: "time when fell", type: "number" }
    //     ]
    // },

    // {
    //     category: "timeseries",
    //     displayName: "Time Series",
    //     fields: [
    //       { name: "sample_id", displayName: "sample id", type: "number" },
    //       { name: "t", displayName: "t", type: "time" },
    //       { name: "x", displayName: "x", type: "number" },
    //       { name: "y", displayName: "y", type: "number" },
    //       { name: "x_s", displayName: "x_s", type: "number" },
    //       { name: "y_s", displayName: "y_s", type: "number" },
    //       { name: "v_s", displayName: "v_s", type: "number" },
    //       { name: "movementtype_s", displayName: "movement type_s", type: "text" }
    //     ]
    // }
  ]
