# from rest_framework.test import APITestCase
# from rest_framework import status
# from unittest.mock import patch, MagicMock


# class ComputeSummaryMeasuresViewTests(APITestCase):
#     @patch('pandas.read_csv')
#     @patch('os.path.exists')
#     @patch('summary_measures.views.Commander')
#     @patch('summary_measures.views.Karpov.ResolveDependencies')
#     def test_post_compute_summary_measures(self, mock_resolve_dependencies, mock_commander, mock_exists, mock_read_csv):
#         # Mock os.path.exists to simulate the presence of the preprocessed file
#         mock_exists.return_value = True

#         # Mock pandas.read_csv to simulate reading the preprocessed file
#         mock_read_csv.return_value = MagicMock(to_numpy=lambda: [[1, 2], [3, 4]])

#         # Mock Karpov.ResolveDependencies to simulate resolving dependencies
#         mock_resolve_dependencies.return_value = (
#             [
#                 'calc_homebases',
#                 'calc_HB1_cumulativeReturn',
#                 'calc_HB1_meanDurationStops',
#                 'calc_HB1_meanReturn',
#                 'calc_HB1_meanExcursionStops',
#                 'calc_HB1_stopDuration',
#                 'calc_HB2_stopDuration',
#                 'calc_HB2_cumulativeReturn',
#                 'calc_HB1_expectedReturn',
#                 'calc_sessionTotalLocalesVisited',
#                 'calc_sessionTotalStops',
#             ],
#             {}  # Mocked dependency data
#         )

#         # Mock Commander.CalculateSummaryMeasures to simulate the calculation
#         mock_commander.return_value.CalculateSummaryMeasures.return_value = {
#             'calc_homebases': [1],
#             'calc_HB1_cumulativeReturn': [2],
#             'calc_HB1_meanDurationStops': [3],
#             'calc_HB1_meanReturn': [4],
#             'calc_HB1_meanExcursionStops': [5],
#             'calc_HB1_stopDuration': [6],
#             'calc_HB2_stopDuration': [7],
#             'calc_HB2_cumulativeReturn': [8],
#             'calc_HB1_expectedReturn': [9],
#             'calc_sessionTotalLocalesVisited': [10],
#             'calc_sessionTotalStops': [11],
#         }

#         # Send request with hardcoded data
#         data = {
#             "trial_ids": [32],  # Simulate selecting preprocessed_trial_32.csv
#             "summary_measures": [
#                 'calc_homebases',
#                 'calc_HB1_cumulativeReturn',
#                 'calc_HB1_meanDurationStops',
#                 'calc_HB1_meanReturn',
#                 'calc_HB1_meanExcursionStops',
#                 'calc_HB1_stopDuration',
#                 'calc_HB2_stopDuration',
#                 'calc_HB2_cumulativeReturn',
#                 'calc_HB1_expectedReturn',
#                 'calc_sessionTotalLocalesVisited',
#                 'calc_sessionTotalStops',
#             ],
#             "environment": "common"
#         }
#         response = self.client.post('/api/summary-measures/compute-summary-measures/', data, format='json')

#         # Assertions
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.assertIn(32, response.data)  # Ensure trial ID is in the response
#         self.assertEqual(
#             response.data[32],
#             {
#                 'calc_homebases': [1],
#                 'calc_HB1_cumulativeReturn': [2],
#                 'calc_HB1_meanDurationStops': [3],
#                 'calc_HB1_meanReturn': [4],
#                 'calc_HB1_meanExcursionStops': [5],
#                 'calc_HB1_stopDuration': [6],
#                 'calc_HB2_stopDuration': [7],
#                 'calc_HB2_cumulativeReturn': [8],
#                 'calc_HB1_expectedReturn': [9],
#                 'calc_sessionTotalLocalesVisited': [10],
#                 'calc_sessionTotalStops': [11],
#             }
#         )

#     def test_post_compute_summary_measures_missing_data(self):
#         # Test with missing summary_measures
#         data = {"trial_ids": []}
#         response = self.client.post('/api/summary-measures/compute-summary-measures/', data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
#         self.assertIn("error", response.data)

#     @patch('os.path.exists', return_value=False)
#     def test_post_compute_summary_measures_file_not_found(self, mock_exists):
#         # Simulate file not found
#         data = {
#             "trial_ids": [32],
#             "summary_measures": ["calc_homebases"],
#             "environment": "common"
#         }
#         response = self.client.post('/api/summary-measures/compute-summary-measures/', data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
#         self.assertIn("error", response.data)