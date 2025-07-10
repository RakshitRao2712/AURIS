package com.example.Auris.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Auris.Model.Image;

public interface ImageRepository  extends JpaRepository<Image, Long>{
    
}
