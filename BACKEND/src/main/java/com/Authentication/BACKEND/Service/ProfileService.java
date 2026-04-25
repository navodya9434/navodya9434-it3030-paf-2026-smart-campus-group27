package com.Authentication.BACKEND.Service;

import com.Authentication.BACKEND.Io.ProfileRequest;
import com.Authentication.BACKEND.Io.ProfileResponse;

public interface ProfileService {

   ProfileResponse createProfile(ProfileRequest request);

   ProfileResponse getProfile(String email);

  


}
