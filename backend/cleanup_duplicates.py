#!/usr/bin/env python3
"""
Script to clean up existing duplicate survey assignments.
This script will find and remove duplicate assignments, keeping only the most recent one.
"""

from models.database import get_db
from datetime import datetime
import asyncio

async def cleanup_duplicate_assignments():
    """
    Find and remove duplicate survey assignments.
    Keeps the most recent assignment for each user-survey combination.
    """
    db = get_db()
    
    print("Starting cleanup of duplicate survey assignments...")
    
    try:
        # Get all superadmin documents
        superadmin_collection = db.collection("superadmin")
        superadmin_docs = superadmin_collection.stream()
        
        total_duplicates_removed = 0
        
        for superadmin_doc in superadmin_docs:
            print(f"Checking superadmin: {superadmin_doc.id}")
            
            # Get all clients under this superadmin
            clients_collection = superadmin_doc.reference.collection("clients")
            clients_docs = clients_collection.stream()
            
            for client_doc in clients_docs:
                print(f"  Checking client: {client_doc.id}")
                
                # Get all assignments for this client
                assignments_collection = client_doc.reference.collection("survey_assignments")
                assignments_docs = assignments_collection.stream()
                
                # Group assignments by user_id + survey_id combination
                assignment_groups = {}
                
                for assignment_doc in assignments_docs:
                    assignment_data = assignment_doc.to_dict()
                    user_id = assignment_data.get("user_id")
                    survey_id = assignment_data.get("survey_id")
                    assigned_at = assignment_data.get("assigned_at")
                    
                    if not user_id or not survey_id:
                        continue
                    
                    key = f"{user_id}_{survey_id}"
                    
                    if key not in assignment_groups:
                        assignment_groups[key] = []
                    
                    assignment_groups[key].append({
                        "doc_id": assignment_doc.id,
                        "doc_ref": assignment_doc.reference,
                        "assigned_at": assigned_at,
                        "data": assignment_data
                    })
                
                # Find and remove duplicates
                client_duplicates_removed = 0
                
                for key, assignments in assignment_groups.items():
                    if len(assignments) > 1:
                        print(f"    Found {len(assignments)} duplicates for {key}")
                        
                        # Sort by assigned_at (most recent first)
                        assignments.sort(key=lambda x: x["assigned_at"] or "", reverse=True)
                        
                        # Keep the first (most recent) and delete the rest
                        for assignment in assignments[1:]:
                            print(f"      Removing duplicate: {assignment['doc_id']}")
                            assignment["doc_ref"].delete()
                            client_duplicates_removed += 1
                
                if client_duplicates_removed > 0:
                    print(f"  Removed {client_duplicates_removed} duplicates for client {client_doc.id}")
                    total_duplicates_removed += client_duplicates_removed
        
        print(f"\n✓ Cleanup completed! Removed {total_duplicates_removed} duplicate assignments total.")
        
        if total_duplicates_removed == 0:
            print("No duplicate assignments found.")
        
    except Exception as e:
        print(f"Error during cleanup: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(cleanup_duplicate_assignments())