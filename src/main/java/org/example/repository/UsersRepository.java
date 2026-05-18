package org.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.example.models.User;


@Repository
public interface UsersRepository extends JpaRepository<User, Long>{

}
