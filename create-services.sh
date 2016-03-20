#!/bin/bash
# Creates an instance of each Watson API in Bluemix
# cf push of this app will bind the services and assign credentials
# cf e <app-name> can be use to return the credentials

cf create-service concept_expansion concept_expansion_free_plan concept_expansion_beta_sdk
cf create-service concept_insights standard concept_insights_sdk
cf create-service dialog standard dialog_sdk
cf create-service document_conversion standard document_conversion_standard_sdk
cf create-service language_translation standard_customizable language_translation_sdk
cf create-service natural_language_classifier standard natural_language_classifier_sdk
cf create-service personality_insights tiered personality_insights_sdk
cf create-service relationship_extraction relationship_extraction_free_plan relationship_extraction_beta_sdk
cf create-service retrieve_and_rank standard retrieve_and_rank_sdk
cf create-service speech_to_text standard speech_to_text_sdk
cf create-service text_to_speech standard text_to_speech_sdk
cf create-service tone_analyzer beta tone_analyzer_beta_sdk
cf create-service tradeoff_analytics standard tradeoff_analytics_sdk
cf create-service visual_insights experimental visual_insights_experimental_sdk
cf create-service visual_recognition free visual_recognition_beta_sdk

# the next command could fail if you already have an instance
cf create-service alchemy_api free alchemy_api_free_sdk