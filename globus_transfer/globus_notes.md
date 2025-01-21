### FRDR Collection layout:
/11/published/publication_xyz/
- file_sizes/
- file_sizes_perm.json
- file_sizes.json
- file_tree.txt
- submitted_data/
    - CITATION.txt
    - frdr-checksums-and-filetypes.md
    - LICENSE.txt
    - Qxy/
        - 02_PublishedReport          
        - 03_Videos_mpgFiles          *(important)*
        - 04_EthoVision_backupFiles   
        - 05_EthoVision_csvTrackFiles *(important)*
        - 06_Pathplots_individual     *(important)*
        - 07_Pathplots_pptxDocument
        - 11_SPSS_savMasterFiles
    - README_Table1to3.html
    - README_Table1to3.xmp
    - README.txt

#### Regex for DataType specification:
"/11/published/publication_[0-9]{3}/submitted_data/Q[0-9]{2}/(03_Videos_mpgFiles|05_EthoVision_csvTrackFiles|06_Pathplots_individual)"  
*Regex for all possible data types.*  
*Note: needs to be updated when preprocessed data is added*

#### Filename format:
[study_id][]