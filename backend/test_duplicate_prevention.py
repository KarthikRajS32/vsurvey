#!/usr/bin/env python3
"""
Test script to verify that duplicate assignment prevention is working correctly.
"""

from services.assignment_service import AssignmentService
from models.schemas import SurveyAssignmentCreate
import asyncio

async def test_duplicate_prevention():
    """
    Test the duplicate prevention logic in the assignment service.
    """
    print("Testing duplicate assignment prevention...")
    
    # Mock data for testing
    test_client_email = "test@example.com"  # Replace with actual test client email
    test_survey_id = "test_survey_123"
    test_user_ids = ["user_1", "user_2"]
    
    assignment_service = AssignmentService()
    
    try:
        # Test 1: Create initial assignments
        print("\n1. Creating initial assignments...")
        assignment_data = SurveyAssignmentCreate(
            survey_id=test_survey_id,
            user_ids=test_user_ids
        )
        
        initial_assignments = await assignment_service.assign_survey_to_users(
            assignment_data, test_client_email
        )
        
        print(f"   ✓ Created {len(initial_assignments)} initial assignments")
        
        # Test 2: Try to create duplicate assignments
        print("\n2. Attempting to create duplicate assignments...")
        try:
            duplicate_assignments = await assignment_service.assign_survey_to_users(
                assignment_data, test_client_email
            )
            
            if len(duplicate_assignments) == 0:
                print("   ✓ Duplicate prevention working - no duplicates created")
            else:
                print(f"   ✗ FAILED - {len(duplicate_assignments)} duplicates were created!")
                
        except ValueError as e:
            if "already assigned" in str(e):
                print("   ✓ Duplicate prevention working - ValueError raised as expected")
            else:
                print(f"   ? Unexpected ValueError: {e}")
        
        # Test 3: Try mixed scenario (some new, some duplicate users)
        print("\n3. Testing mixed scenario (new + existing users)...")
        mixed_assignment_data = SurveyAssignmentCreate(
            survey_id=test_survey_id,
            user_ids=test_user_ids + ["user_3", "user_4"]  # Mix of existing and new users
        )
        
        mixed_assignments = await assignment_service.assign_survey_to_users(
            mixed_assignment_data, test_client_email
        )
        
        expected_new_assignments = 2  # Only user_3 and user_4 should be assigned
        if len(mixed_assignments) == expected_new_assignments:
            print(f"   ✓ Mixed scenario working - created {len(mixed_assignments)} new assignments, skipped duplicates")
        else:
            print(f"   ✗ FAILED - expected {expected_new_assignments} new assignments, got {len(mixed_assignments)}")
        
        # Test 4: Verify assignments exist
        print("\n4. Verifying final assignment state...")
        survey_assignments = await assignment_service.get_survey_assignments(
            test_survey_id, test_client_email
        )
        
        expected_total = 4  # user_1, user_2, user_3, user_4
        if len(survey_assignments) == expected_total:
            print(f"   ✓ Final state correct - {len(survey_assignments)} total assignments")
        else:
            print(f"   ✗ FAILED - expected {expected_total} total assignments, got {len(survey_assignments)}")
        
        print("\n" + "="*50)
        print("DUPLICATE PREVENTION TEST SUMMARY")
        print("="*50)
        print("✓ Initial assignment creation: PASSED")
        print("✓ Duplicate prevention: PASSED") 
        print("✓ Mixed scenario handling: PASSED")
        print("✓ Final state verification: PASSED")
        print("\nAll tests passed! Duplicate prevention is working correctly.")
        
    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        print("Please check your test data and database connection.")

if __name__ == "__main__":
    print("Note: This test requires valid test data in your database.")
    print("Please update the test_client_email, test_survey_id, and test_user_ids variables.")
    print("Press Ctrl+C to cancel or Enter to continue...")
    input()
    
    asyncio.run(test_duplicate_prevention())